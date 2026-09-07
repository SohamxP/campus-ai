from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def create_embedding(text: str) -> list[float]:
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

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False,
    )

    return embeddings.tolist()
