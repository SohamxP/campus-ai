from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.auth.authorization import require_course_owner
from app.auth.dependencies import get_current_user_id
from app.db.chunk_repository import insert_chunks
from app.db.document_repository import (
    create_document,
    delete_document,
    mark_document_ready,
)
from app.db.database import get_connection
from app.services.embedding_service import create_embedding
from app.services.pdf_service import (
    chunk_pdf_pages,
    extract_pdf_pages,
)

router = APIRouter(tags=["documents"])


def validate_pdf(file: UploadFile):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )


def get_document_course_id(
    document_id: str,
) -> str | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT course_id
                FROM documents
                WHERE id = %s
                """,
                (document_id,),
            )

            row = cur.fetchone()

    return str(row[0]) if row else None


@router.post("/documents/preview")
async def preview_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    validate_pdf(file)

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    pages = extract_pdf_pages(file_bytes)
    chunks = chunk_pdf_pages(pages)

    return {
        "filename": file.filename,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "chunks": chunks[:10],
    }


@router.post("/courses/{course_id}/documents")
async def ingest_document(
    course_id: UUID,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    validate_pdf(file)

    require_course_owner(
        str(course_id),
        user_id,
    )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    pages = extract_pdf_pages(file_bytes)
    chunks = chunk_pdf_pages(pages)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF.",
        )

    document_id = create_document(
        course_id=str(course_id),
        filename=file.filename or "document.pdf",
        page_count=len(pages),
    )

    embedded_chunks = []

    for chunk in chunks:
        embedded_chunks.append(
            {
                **chunk,
                "embedding": create_embedding(
                    chunk["content"]
                ),
            }
        )

    insert_chunks(
        document_id=document_id,
        course_id=str(course_id),
        chunks=embedded_chunks,
    )

    mark_document_ready(document_id)

    return {
        "document_id": document_id,
        "course_id": str(course_id),
        "filename": file.filename,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "status": "ready",
    }


@router.delete("/documents/{document_id}")
def remove_document(
    document_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    course_id = get_document_course_id(
        str(document_id)
    )

    if course_id is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    require_course_owner(
        course_id,
        user_id,
    )

    deleted = delete_document(str(document_id))

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return {
        "deleted": True,
        "document_id": str(document_id),
    }
