from pgvector.psycopg import register_vector

from app.db.database import get_connection


def insert_chunks(
    document_id: str,
    course_id: str,
    chunks: list[dict],
):
    with get_connection() as conn:
        register_vector(conn)

        with conn.cursor() as cur:
            for chunk in chunks:
                cur.execute(
                    """
                    INSERT INTO document_chunks (
                        document_id,
                        course_id,
                        page_number,
                        chunk_index,
                        content,
                        embedding
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        document_id,
                        course_id,
                        chunk["page_number"],
                        chunk["chunk_index"],
                        chunk["content"],
                        chunk["embedding"],
                    ),
                )

        conn.commit()
