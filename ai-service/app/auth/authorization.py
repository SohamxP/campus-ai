from fastapi import HTTPException

from app.db.course_repository import get_course


def require_course_owner(
    course_id: str,
    user_id: str,
) -> dict:
    course = get_course(course_id)

    if course is None or course["user_id"] != user_id:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    return course
