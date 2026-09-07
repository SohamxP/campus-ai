import numpy as np
from pgvector.psycopg import register_vector

from app.db.database import get_connection


def _serialize_row(row):
    return {
        "chunk_id": str(row[0]),
        "document_id": str(row[1]),
        "filename": row[2],
        "page_number": row[3],
        "chunk_index": row[4],
        "content": row[5],
        "score": float(row[6]),
    }


def retrieve_vector_chunks(
    course_id: str,
    query_embedding: list[float],
    limit: int = 5,
):
    embedding_vector = np.array(query_embedding, dtype=np.float32)

    with get_connection() as conn:
        register_vector(conn)

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    dc.id,
                    dc.document_id,
                    d.filename,
                    dc.page_number,
                    dc.chunk_index,
                    dc.content,
                    1 - (dc.embedding <=> %s) AS score
                FROM document_chunks dc
                JOIN documents d
                    ON d.id = dc.document_id
                WHERE dc.course_id = %s
                  AND dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> %s
                LIMIT %s
                """,
                (
                    embedding_vector,
                    course_id,
                    embedding_vector,
                    limit,
                ),
            )

            rows = cur.fetchall()

    return [_serialize_row(row) for row in rows]


def retrieve_keyword_chunks(
    course_id: str,
    question: str,
    limit: int = 5,
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    dc.id,
                    dc.document_id,
                    d.filename,
                    dc.page_number,
                    dc.chunk_index,
                    dc.content,
                    ts_rank_cd(
                        to_tsvector('english', dc.content),
                        websearch_to_tsquery('english', %s)
                    ) AS score
                FROM document_chunks dc
                JOIN documents d
                    ON d.id = dc.document_id
                WHERE dc.course_id = %s
                  AND to_tsvector('english', dc.content)
                      @@ websearch_to_tsquery('english', %s)
                ORDER BY score DESC
                LIMIT %s
                """,
                (
                    question,
                    course_id,
                    question,
                    limit,
                ),
            )

            rows = cur.fetchall()

    return [_serialize_row(row) for row in rows]


def reciprocal_rank_fusion(
    vector_results: list[dict],
    keyword_results: list[dict],
    limit: int = 5,
    k: int = 60,
):
    fused = {}

    for rank, result in enumerate(vector_results, start=1):
        chunk_id = result["chunk_id"]

        if chunk_id not in fused:
            fused[chunk_id] = {
                **result,
                "rrf_score": 0.0,
                "vector_rank": None,
                "keyword_rank": None,
            }

        fused[chunk_id]["rrf_score"] += 1 / (k + rank)
        fused[chunk_id]["vector_rank"] = rank

    for rank, result in enumerate(keyword_results, start=1):
        chunk_id = result["chunk_id"]

        if chunk_id not in fused:
            fused[chunk_id] = {
                **result,
                "rrf_score": 0.0,
                "vector_rank": None,
                "keyword_rank": None,
            }

        fused[chunk_id]["rrf_score"] += 1 / (k + rank)
        fused[chunk_id]["keyword_rank"] = rank

    ranked = sorted(
        fused.values(),
        key=lambda item: item["rrf_score"],
        reverse=True,
    )

    return ranked[:limit]


def retrieve_hybrid_chunks(
    course_id: str,
    question: str,
    query_embedding: list[float],
    limit: int = 5,
):
    candidate_limit = max(limit * 2, 20)

    vector_results = retrieve_vector_chunks(
        course_id=course_id,
        query_embedding=query_embedding,
        limit=candidate_limit,
    )

    keyword_results = retrieve_keyword_chunks(
        course_id=course_id,
        question=question,
        limit=candidate_limit,
    )

    return reciprocal_rank_fusion(
        vector_results=vector_results,
        keyword_results=keyword_results,
        limit=limit,
    )


# Backward-compatible alias for existing code.
def retrieve_similar_chunks(
    course_id: str,
    query_embedding: list[float],
    limit: int = 5,
):
    return retrieve_vector_chunks(
        course_id=course_id,
        query_embedding=query_embedding,
        limit=limit,
    )


def retrieve_reranked_chunks(
    course_id: str,
    question: str,
    query_embedding: list[float],
    limit: int = 5,
):
    from app.services.reranker_service import rerank_chunks

    candidate_limit = max(limit * 4, 20)

    candidates = retrieve_hybrid_chunks(
        course_id=course_id,
        question=question,
        query_embedding=query_embedding,
        limit=candidate_limit,
    )

    return rerank_chunks(
        question=question,
        chunks=candidates,
        limit=limit,
    )
