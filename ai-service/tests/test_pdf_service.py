from app.services.pdf_service import chunk_text


def test_chunk_text_short_text():
    text = "CampusAI helps students study."

    chunks = chunk_text(text)

    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_long_text():
    text = "A" * 2500

    chunks = chunk_text(
        text,
        chunk_size=1000,
        overlap=100,
    )

    assert len(chunks) == 3
    assert len(chunks[0]) == 1000
    assert len(chunks[1]) == 1000


def test_chunk_text_empty():
    assert chunk_text("") == []
