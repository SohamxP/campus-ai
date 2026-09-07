from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db.course_repository import (
    create_course,
    delete_course,
    get_course,
    list_courses,
)
from app.db.document_repository import list_documents_for_course

router = APIRouter(prefix="/courses", tags=["courses"])


class CreateCourseRequest(BaseModel):
    user_id: UUID
    name: str = Field(min_length=1, max_length=120)
    code: str | None = Field(default=None, max_length=40)


@router.post("")
def create(request: CreateCourseRequest):
    return create_course(
        user_id=str(request.user_id),
        name=request.name.strip(),
        code=request.code.strip() if request.code else None,
    )


@router.get("")
def get_courses(user_id: UUID):
    return {
        "courses": list_courses(str(user_id)),
    }


@router.get("/{course_id}")
def get(course_id: UUID):
    course = get_course(str(course_id))

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    return course


@router.get("/{course_id}/documents")
def documents(course_id: UUID):
    course = get_course(str(course_id))

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    return {
        "course_id": str(course_id),
        "documents": list_documents_for_course(
            str(course_id)
        ),
    }


@router.delete("/{course_id}")
def remove(course_id: UUID):
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
