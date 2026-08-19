import json
from openai import OpenAI
from pydantic import BaseModel, Field
from knowledge.retriever import Retriever
from knowledge.chunk import Chunk

client = OpenAI()


# The SHAPE we demand back — a grounded answer plus the docs it relied on,
# never free-form prose the platform can't act on or audit.
class Answer(BaseModel):
    text: str = Field(description="The answer, grounded only in the context")
    cited_doc_ids: list[str] = Field(description="Source docs used")
    grounded: bool = Field(description="False if the context did not contain the answer")


SYSTEM = (
    "You are an internal enterprise assistant. Answer ONLY from the provided "
    "context passages. If the context does not contain the answer, set grounded "
    "to false and say you don't know. Never invent facts. Respond ONLY as JSON "
    'matching: {"text": string, "cited_doc_ids": string[], "grounded": bool}.'
)


def build_context(chunks: list[Chunk]) -> str:
    # Number each passage and tag it with its doc id so the model can cite it.
    return "\n\n".join(f"[doc:{c.doc_id}] {c.text}" for c in chunks)


def answer_question(retriever: Retriever, question: str) -> Answer:
    chunks = retriever.top_k(question, k=4)         # retrieve the evidence
    context = build_context(chunks)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},     # force valid JSON
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
    )
    return Answer.model_validate_json(resp.choices[0].message.content)
