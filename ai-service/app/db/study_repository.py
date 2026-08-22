import json

from app.db.database import get_connection


def get_course_chunks(course_id: str, limit: int = 30) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    page_number,
                    content
                FROM document_chunks
                WHERE course_id = %s
                ORDER BY page_number, chunk_index
                LIMIT %s
                """,
                (course_id, limit),
            )

            rows = cur.fetchall()

    return [
        {
            "page_number": row[0],
            "content": row[1],
        }
        for row in rows
    ]


def save_flashcards(
    course_id: str,
    flashcards: list[dict],
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            for card in flashcards:
                cur.execute(
                    """
                    INSERT INTO flashcards (
                        course_id,
                        front,
                        back,
                        source_page,
                        topic
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        course_id,
                        card["front"],
                        card["back"],
                        card.get("source_page"),
                        card.get("topic"),
                    ),
                )

        conn.commit()


def list_flashcards(course_id: str) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    front,
                    back,
                    source_page,
                    topic
                FROM flashcards
                WHERE course_id = %s
                ORDER BY created_at DESC
                """,
                (course_id,),
            )

            rows = cur.fetchall()

    return [
        {
            "id": str(row[0]),
            "front": row[1],
            "back": row[2],
            "source_page": row[3],
            "topic": row[4],
        }
        for row in rows
    ]


def save_quiz_questions(
    course_id: str,
    questions: list[dict],
):
    saved = []

    with get_connection() as conn:
        with conn.cursor() as cur:
            for item in questions:
                cur.execute(
                    """
                    INSERT INTO quiz_questions (
                        course_id,
                        question,
                        options,
                        correct_answer,
                        explanation,
                        source_page,
                        topic
                    )
                    VALUES (%s, %s, %s::jsonb, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        course_id,
                        item["question"],
                        json.dumps(item["options"]),
                        item["correct_answer"],
                        item.get("explanation"),
                        item.get("source_page"),
                        item.get("topic"),
                    ),
                )

                question_id = cur.fetchone()[0]

                saved.append({
                    "id": str(question_id),
                    **item,
                })

        conn.commit()

    return saved


def list_quiz_questions(course_id: str) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    question,
                    options,
                    explanation,
                    source_page,
                    topic
                FROM quiz_questions
                WHERE course_id = %s
                ORDER BY created_at DESC
                """,
                (course_id,),
            )

            rows = cur.fetchall()

    return [
        {
            "id": str(row[0]),
            "question": row[1],
            "options": row[2],
            "explanation": row[3],
            "source_page": row[4],
            "topic": row[5],
        }
        for row in rows
    ]


def submit_quiz_answer(
    question_id: str,
    selected_answer: str,
) -> dict:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    course_id,
                    correct_answer,
                    explanation,
                    topic
                FROM quiz_questions
                WHERE id = %s
                """,
                (question_id,),
            )

            row = cur.fetchone()

            if row is None:
                return None

            course_id = str(row[0])
            correct_answer = row[1]
            explanation = row[2]
            topic = row[3] or "General"

            is_correct = selected_answer == correct_answer

            cur.execute(
                """
                INSERT INTO quiz_attempts (
                    question_id,
                    selected_answer,
                    is_correct
                )
                VALUES (%s, %s, %s)
                """,
                (
                    question_id,
                    selected_answer,
                    is_correct,
                ),
            )

            cur.execute(
                """
                INSERT INTO concept_mastery (
                    course_id,
                    topic,
                    attempts,
                    correct,
                    mastery_score
                )
                VALUES (
                    %s,
                    %s,
                    1,
                    %s,
                    %s
                )
                ON CONFLICT (course_id, topic)
                DO UPDATE SET
                    attempts = concept_mastery.attempts + 1,
                    correct = concept_mastery.correct + EXCLUDED.correct,
                    mastery_score =
                        (
                            concept_mastery.correct
                            + EXCLUDED.correct
                        )::double precision
                        /
                        (
                            concept_mastery.attempts + 1
                        ),
                    updated_at = now()
                """,
                (
                    course_id,
                    topic,
                    1 if is_correct else 0,
                    1.0 if is_correct else 0.0,
                ),
            )

        conn.commit()

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "explanation": explanation,
        "topic": topic,
    }


def get_mastery(course_id: str) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    topic,
                    attempts,
                    correct,
                    mastery_score
                FROM concept_mastery
                WHERE course_id = %s
                ORDER BY mastery_score ASC, attempts DESC
                """,
                (course_id,),
            )

            rows = cur.fetchall()

    return [
        {
            "topic": row[0],
            "attempts": row[1],
            "correct": row[2],
            "mastery_score": float(row[3]),
        }
        for row in rows
    ]


def get_course_topics(course_id: str) -> list[str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT name
                FROM course_topics
                WHERE course_id = %s
                ORDER BY name
                """,
                (course_id,),
            )

            rows = cur.fetchall()

    return [row[0] for row in rows]


def get_quiz_question_course_id(
    question_id: str,
) -> str | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT course_id
                FROM quiz_questions
                WHERE id = %s
                """,
                (question_id,),
            )

            row = cur.fetchone()

    return str(row[0]) if row else None
