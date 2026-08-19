import math
from openai import OpenAI
from knowledge.chunk import Chunk

client = OpenAI()  # reads OPENAI_API_KEY from the environment


def embed(text: str) -> list[float]:
    # Turn text into a vector. Similar meanings land near each other in space.
    resp = client.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding


def cosine(a: list[float], b: list[float]) -> float:
    # Cosine similarity: 1.0 = identical direction, 0 = unrelated.
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


class Retriever:
    """An in-memory vector index over enterprise document chunks."""

    def __init__(self) -> None:
        self._index: list[tuple[Chunk, list[float]]] = []

    def add(self, chunks: list[Chunk]) -> None:
        for c in chunks:
            self._index.append((c, embed(c.text)))

    def top_k(self, question: str, k: int = 4) -> list[Chunk]:
        # Embed the question, score every chunk, return the k closest.
        q = embed(question)
        scored = sorted(self._index, key=lambda pair: cosine(q, pair[1]), reverse=True)
        return [chunk for chunk, _vec in scored[:k]]
