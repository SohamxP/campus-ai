from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.db.retrieval_repository import retrieve_similar_chunks
from app.services.embedding_service import create_embedding
from app.services.generation_service import generate_grounded_answer

router = APIRouter(prefix="/query", tags=["query"])


class RetrievalRequest(BaseModel):
    course_id: UUID
    question: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)


class Source(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    page_number: int
    similarity: float


@router.post("/retrieve")
def retrieve(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_similar_chunks(
        course_id=str(request.course_id),
        query_embedding=query_embedding,
        limit=request.limit,
    )

    return {
        "question": request.question,
        "results": chunks,
    }


@router.post("/answer")
def answer(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_similar_chunks(
        course_id=str(request.course_id),
        query_embedding=query_embedding,
        limit=request.limit,
    )

    if not chunks:
        return {
            "question": request.question,
            "answer": "I could not find relevant course material for this question.",
            "sources": [],
        }

    generated_answer = generate_grounded_answer(
        question=request.question,
        chunks=chunks,
    )

    sources = [
        {
            "chunk_id": chunk["chunk_id"],
            "document_id": chunk["document_id"],
            "filename": chunk["filename"],
            "page_number": chunk["page_number"],
            "similarity": round(chunk["similarity"], 4),
        }
        for chunk in chunks
    ]

    return {
        "question": request.question,
        "answer": generated_answer,
        "sources": sources,
    }
