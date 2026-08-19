# Enterprise docs are long; LLMs and retrieval work best on small passages.
# We split each document into overlapping CHUNKS so a relevant answer isn't
# severed at a boundary, and each chunk keeps a pointer back to its source doc.
from dataclasses import dataclass


@dataclass
class Chunk:
    doc_id: str
    text: str


def chunk_document(doc_id: str, body: str, size: int = 600, overlap: int = 80) -> list[Chunk]:
    words = body.split()
    chunks: list[Chunk] = []
    start = 0
    while start < len(words):
        window = words[start:start + size]
        chunks.append(Chunk(doc_id=doc_id, text=" ".join(window)))
        if start + size >= len(words):
            break
        # advance by size MINUS overlap so adjacent chunks share context
        start += size - overlap
    return chunks
