from app.db.database import get_connection


def create_course(
    user_id: str,
    name: str,
    code: str | None,
) -> dict:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO courses (
                    user_id,
                    name,
                    code
                )
                VALUES (%s, %s, %s)
                RETURNING id, user_id, name, code, created_at
                """,
                (
                    user_id,
                    name,
                    code,
                ),
            )

            row = cur.fetchone()

        conn.commit()

    return {
        "id": str(row[0]),
        "user_id": str(row[1]),
        "name": row[2],
        "code": row[3],
        "created_at": row[4],
    }


def list_courses(user_id: str) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    user_id,
                    name,
                    code,
                    created_at
                FROM courses
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (user_id,),
            )

            rows = cur.fetchall()

    return [
        {
            "id": str(row[0]),
            "user_id": str(row[1]),
            "name": row[2],
            "code": row[3],
            "created_at": row[4],
        }
        for row in rows
    ]


def get_course(course_id: str) -> dict | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    user_id,
                    name,
                    code,
                    created_at
                FROM courses
                WHERE id = %s
                """,
                (course_id,),
            )

            row = cur.fetchone()

    if row is None:
        return None

    return {
        "id": str(row[0]),
        "user_id": str(row[1]),
        "name": row[2],
        "code": row[3],
        "created_at": row[4],
    }


def delete_course(course_id: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM courses
                WHERE id = %s
                """,
                (course_id,),
            )

            deleted = cur.rowcount > 0

        conn.commit()

    return deleted
