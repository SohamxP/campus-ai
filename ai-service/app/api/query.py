from fastapi import APIRouter
from pydantic import BaseModel

from app.db.retrieval_repository import retrieve_similar_chunks
from app.services.embedding_service import create_embedding

router = APIRouter(prefix="/query", tags=["query"])


class RetrievalRequest(BaseModel):
    course_id: str
    question: str
    limit: int = 5


@router.post("/retrieve")
def retrieve(request: RetrievalRequest):
    query_embedding = create_embedding(request.question)

    chunks = retrieve_similar_chunks(
        course_id=request.course_id,
        query_embedding=query_embedding,
        limit=request.limit,
    )

    return {
        "question": request.question,
        "results": chunks,
    }
