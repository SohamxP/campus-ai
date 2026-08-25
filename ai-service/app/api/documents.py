from uuid import UUID
import time

from fastapi import (
    APIRouter,
    BackgroundTasks,
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
    mark_document_failed,
    mark_document_ready,
)
from app.db.database import get_connection
from app.services.embedding_service import create_embeddings
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


def process_document(
    document_id: str,
    course_id: str,
    file_bytes: bytes,
):
    total_start = time.perf_counter()

    try:
        start = time.perf_counter()
        pages = extract_pdf_pages(file_bytes)
        print(
            f"[{document_id}] PDF extraction: "
            f"{time.perf_counter() - start:.2f}s"
        )

        start = time.perf_counter()
        chunks = chunk_pdf_pages(pages)
        print(
            f"[{document_id}] Chunking: "
            f"{time.perf_counter() - start:.2f}s "
            f"({len(chunks)} chunks)"
        )

        if not chunks:
            mark_document_failed(document_id)
            print(
                f"[{document_id}] Failed: no readable chunks"
            )
            return

        start = time.perf_counter()
        embeddings = create_embeddings(
            [chunk["content"] for chunk in chunks]
        )
        print(
            f"[{document_id}] Embeddings: "
            f"{time.perf_counter() - start:.2f}s"
        )

        embedded_chunks = [
            {
                **chunk,
                "embedding": embedding,
            }
            for chunk, embedding in zip(
                chunks,
                embeddings,
            )
        ]

        start = time.perf_counter()
        insert_chunks(
            document_id=document_id,
            course_id=course_id,
            chunks=embedded_chunks,
        )
        print(
            f"[{document_id}] DB insert: "
            f"{time.perf_counter() - start:.2f}s"
        )

        mark_document_ready(
            document_id=document_id,
            page_count=len(pages),
        )

        print(
            f"[{document_id}] Total: "
            f"{time.perf_counter() - total_start:.2f}s"
        )

    except Exception as exc:
        print(
            f"Document processing failed "
            f"for {document_id}: {exc}"
        )

        mark_document_failed(document_id)


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
    background_tasks: BackgroundTasks,
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

    document_id = create_document(
        course_id=str(course_id),
        filename=file.filename or "document.pdf",
    )

    background_tasks.add_task(
        process_document,
        document_id,
        str(course_id),
        file_bytes,
    )

    return {
        "document_id": document_id,
        "course_id": str(course_id),
        "filename": file.filename,
        "page_count": 0,
        "chunk_count": 0,
        "status": "processing",
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
