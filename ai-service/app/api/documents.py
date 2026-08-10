from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.db.chunk_repository import insert_chunks
from app.db.document_repository import create_document, mark_document_ready
from app.services.embedding_service import create_embedding
from app.services.pdf_service import extract_pdf_pages, chunk_pdf_pages

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/preview")
async def preview_document(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

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


@router.post("/ingest")
async def ingest_document(
    course_id: str = Form(...),
    file: UploadFile = File(...),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
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
        course_id=course_id,
        filename=file.filename or "document.pdf",
        page_count=len(pages),
    )

    embedded_chunks = []

    for chunk in chunks:
        embedded_chunks.append({
            **chunk,
            "embedding": create_embedding(chunk["content"]),
        })

    insert_chunks(
        document_id=document_id,
        course_id=course_id,
        chunks=embedded_chunks,
    )

    mark_document_ready(document_id)

    return {
        "document_id": document_id,
        "filename": file.filename,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "status": "ready",
    }
