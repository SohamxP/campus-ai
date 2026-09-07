from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user_id
from app.db.course_repository import (
    create_course,
    delete_course,
    get_course,
    list_courses,
)
from app.db.document_repository import list_documents_for_course

router = APIRouter(prefix="/courses", tags=["courses"])


class CreateCourseRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: str | None = Field(default=None, max_length=40)


def require_owned_course(
    course_id: UUID,
    user_id: str,
) -> dict:
    course = get_course(str(course_id))

    if course is None or course["user_id"] != user_id:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    return course


@router.post("")
def create(
    request: CreateCourseRequest,
    user_id: str = Depends(get_current_user_id),
):
    return create_course(
        user_id=user_id,
        name=request.name.strip(),
        code=request.code.strip() if request.code else None,
    )


@router.get("")
def get_courses(
    user_id: str = Depends(get_current_user_id),
):
    return {
        "courses": list_courses(user_id),
    }


@router.get("/{course_id}")
def get(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    return require_owned_course(
        course_id,
        user_id,
    )


@router.get("/{course_id}/documents")
def documents(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    require_owned_course(
        course_id,
        user_id,
    )

    return {
        "course_id": str(course_id),
        "documents": list_documents_for_course(
            str(course_id)
        ),
    }


@router.delete("/{course_id}")
def remove(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    require_owned_course(
        course_id,
        user_id,
    )

    deleted = delete_course(str(course_id))

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    return {
        "deleted": True,
        "course_id": str(course_id),
    }
