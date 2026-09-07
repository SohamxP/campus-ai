from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.db.retrieval_repository import (
    retrieve_hybrid_chunks,
    retrieve_reranked_chunks,
    retrieve_vector_chunks,
)
from app.services.embedding_service import create_embedding
from app.services.generation_service import generate_grounded_answer

router = APIRouter(prefix="/query", tags=["query"])


class RetrievalRequest(BaseModel):
    course_id: UUID
    question: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)


@router.post("/retrieve")
def retrieve(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_vector_chunks(
        course_id=str(request.course_id),
        query_embedding=query_embedding,
        limit=request.limit,
    )

    return {
        "retrieval_type": "vector",
        "question": request.question,
        "results": chunks,
    }


@router.post("/retrieve-hybrid")
def retrieve_hybrid(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_hybrid_chunks(
        course_id=str(request.course_id),
        question=request.question,
        query_embedding=query_embedding,
        limit=request.limit,
    )

    return {
        "retrieval_type": "hybrid",
        "question": request.question,
        "results": chunks,
    }


@router.post("/retrieve-reranked")
def retrieve_reranked(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_reranked_chunks(
        course_id=str(request.course_id),
        question=request.question,
        query_embedding=query_embedding,
        limit=request.limit,
    )

    return {
        "retrieval_type": "hybrid_reranked",
        "question": request.question,
        "results": chunks,
    }


@router.post("/answer")
def answer(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_reranked_chunks(
        course_id=str(request.course_id),
        question=request.question,
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
            "rrf_score": round(chunk["rrf_score"], 6),
            "reranker_score": round(chunk["reranker_score"], 6),
        }
        for chunk in chunks
    ]

    return {
        "question": request.question,
        "answer": generated_answer,
        "sources": sources,
    }