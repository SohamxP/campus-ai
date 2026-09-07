import numpy as np
from pgvector.psycopg import register_vector

from app.db.database import get_connection


def retrieve_similar_chunks(
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
                    1 - (dc.embedding <=> %s) AS similarity
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

    return [
        {
            "chunk_id": str(row[0]),
            "document_id": str(row[1]),
            "filename": row[2],
            "page_number": row[3],
            "chunk_index": row[4],
            "content": row[5],
            "similarity": float(row[6]),
        }
        for row in rows
    ]
