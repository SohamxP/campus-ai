from app.db.database import get_connection


def create_document(
    course_id: str,
    filename: str,
    page_count: int,
) -> str:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO documents (
                    course_id,
                    filename,
                    page_count,
                    status
                )
                VALUES (%s, %s, %s, 'processing')
                RETURNING id
                """,
                (
                    course_id,
                    filename,
                    page_count,
                ),
            )

            document_id = cur.fetchone()[0]

        conn.commit()

    return str(document_id)


def mark_document_ready(document_id: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE documents
                SET status = 'ready'
                WHERE id = %s
                """,
                (document_id,),
            )

        conn.commit()


def list_documents_for_course(course_id: str) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    course_id,
                    filename,
                    page_count,
                    status,
                    created_at
                FROM documents
                WHERE course_id = %s
                ORDER BY created_at DESC
                """,
                (course_id,),
            )

            rows = cur.fetchall()

    return [
        {
            "id": str(row[0]),
            "course_id": str(row[1]),
            "filename": row[2],
            "page_count": row[3],
            "status": row[4],
            "created_at": row[5],
        }
        for row in rows
    ]


def delete_document(document_id: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM documents
                WHERE id = %s
                """,
                (document_id,),
            )

            deleted = cur.rowcount > 0

        conn.commit()

    return deleted
