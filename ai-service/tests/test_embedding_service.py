from app.services.embedding_service import create_embedding


def test_create_embedding():
    embedding = create_embedding(
        "CampusAI helps students understand course material."
    )

    assert isinstance(embedding, list)
    assert len(embedding) == 384
