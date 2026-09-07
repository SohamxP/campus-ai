from io import BytesIO
from typing import List, Dict

from pypdf import PdfReader


def sanitize_text(text: str) -> str:
    return text.replace("\x00", "").strip()


def extract_pdf_pages(file_bytes: bytes) -> List[Dict]:
    reader = PdfReader(BytesIO(file_bytes))

    pages = []

    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ""

        pages.append({
            "page_number": index + 1,
            "text": sanitize_text(text),
        })

    return pages


def chunk_text(
    text: str,
    chunk_size: int = 1200,
    overlap: int = 200,
) -> List[str]:
    text = sanitize_text(text)

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = sanitize_text(text[start:end])

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - overlap

    return chunks


def chunk_pdf_pages(pages: List[Dict]) -> List[Dict]:
    chunks = []

    for page in pages:
        page_chunks = chunk_text(page["text"])

        for index, chunk in enumerate(page_chunks):
            chunks.append({
                "page_number": page["page_number"],
                "chunk_index": index,
                "content": chunk,
            })

    return chunks
