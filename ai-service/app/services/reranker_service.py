from sentence_transformers import CrossEncoder

MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

model = CrossEncoder(MODEL_NAME)


def rerank_chunks(
    question: str,
    chunks: list[dict],
    limit: int = 5,
) -> list[dict]:
    if not chunks:
        return []

    pairs = [
        [question, chunk["content"]]
        for chunk in chunks
    ]

    scores = model.predict(pairs)

    reranked = []

    for chunk, score in zip(chunks, scores):
        reranked.append({
            **chunk,
            "reranker_score": float(score),
        })

    reranked.sort(
        key=lambda item: item["reranker_score"],
        reverse=True,
    )

    return reranked[:limit]
