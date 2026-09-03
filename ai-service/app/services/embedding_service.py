from openai import OpenAI

from app.core_config import settings


_openai_client = OpenAI(
    api_key=settings.openai_api_key,
)

_local_model = None


def _get_local_model():
    global _local_model

    if _local_model is None:
        from sentence_transformers import SentenceTransformer

        _local_model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    return _local_model


def create_embedding(text: str) -> list[float]:
    if settings.embedding_provider == "openai":
        response = _openai_client.embeddings.create(
            model=settings.openai_embedding_model,
            input=text,
            dimensions=settings.embedding_dimensions,
        )

        return response.data[0].embedding

    model = _get_local_model()

    embedding = model.encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()


def create_embeddings(
    texts: list[str],
) -> list[list[float]]:
    if not texts:
        return []

    if settings.embedding_provider == "openai":
        response = _openai_client.embeddings.create(
            model=settings.openai_embedding_model,
            input=texts,
            dimensions=settings.embedding_dimensions,
        )

        ordered = sorted(
            response.data,
            key=lambda item: item.index,
        )

        return [
            item.embedding
            for item in ordered
        ]

    model = _get_local_model()

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False,
    )

    return embeddings.tolist()
