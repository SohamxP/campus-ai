from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.authorization import require_course_owner
from app.auth.dependencies import get_current_user_id
from app.db.study_repository import (
    get_course_chunks,
    get_course_topics,
    get_mastery,
    get_quiz_question_course_id,
    list_flashcards,
    list_quiz_questions,
    save_flashcards,
    save_quiz_questions,
    submit_quiz_answer,
)
from app.services.study_service import (
    generate_flashcards,
    generate_quiz,
)
from app.services.topic_service import normalize_topic

router = APIRouter(tags=["study"])


class GenerateRequest(BaseModel):
    count: int = Field(default=5, ge=1, le=15)


class AnswerRequest(BaseModel):
    selected_answer: str = Field(min_length=1)


@router.post("/courses/{course_id}/flashcards/generate")
def create_flashcards(
    course_id: UUID,
    request: GenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    require_course_owner(
        str(course_id),
        user_id,
    )

    chunks = get_course_chunks(str(course_id), limit=30)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Course has no indexed material.",
        )

    flashcards = generate_flashcards(
        chunks,
        request.count,
    )

    save_flashcards(
        str(course_id),
        flashcards,
    )

    return {
        "flashcards": flashcards,
    }


@router.get("/courses/{course_id}/flashcards")
def get_flashcards(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    require_course_owner(
        str(course_id),
        user_id,
    )

    return {
        "flashcards": list_flashcards(
            str(course_id)
        )
    }


@router.post("/courses/{course_id}/quiz/generate")
def create_quiz(
    course_id: UUID,
    request: GenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    require_course_owner(
        str(course_id),
        user_id,
    )

    chunks = get_course_chunks(str(course_id), limit=30)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Course has no indexed material.",
        )

    questions = generate_quiz(
        chunks,
        request.count,
    )

    canonical_topics = get_course_topics(
        str(course_id)
    )

    for question in questions:
        question["topic"] = normalize_topic(
            question["topic"],
            canonical_topics,
        )

    saved = save_quiz_questions(
        str(course_id),
        questions,
    )

    return {
        "questions": saved,
    }


@router.get("/courses/{course_id}/quiz")
def get_quiz(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    require_course_owner(
        str(course_id),
        user_id,
    )

    return {
        "questions": list_quiz_questions(
            str(course_id)
        )
    }


@router.post("/quiz/{question_id}/answer")
def answer_question(
    question_id: UUID,
    request: AnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    course_id = get_quiz_question_course_id(
        str(question_id)
    )

    if course_id is None:
        raise HTTPException(
            status_code=404,
            detail="Quiz question not found.",
        )

    require_course_owner(
        course_id,
        user_id,
    )

    result = submit_quiz_answer(
        str(question_id),
        request.selected_answer,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Quiz question not found.",
        )

    return result


@router.get("/courses/{course_id}/mastery")
def mastery(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    require_course_owner(
        str(course_id),
        user_id,
    )

    return {
        "mastery": get_mastery(
            str(course_id)
        )
    }
