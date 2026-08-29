from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api import courses, documents
from app.auth.dependencies import get_current_user_id
from app.main import app


client = TestClient(app)


@pytest.fixture
def authenticated_user():
    app.dependency_overrides[
        get_current_user_id
    ] = lambda: "user-1"

    yield "user-1"

    app.dependency_overrides.clear()


def test_unauthenticated_course_request_returns_401():
    course_id = uuid4()

    response = client.get(
        f"/courses/{course_id}"
    )

    assert response.status_code == 401


def test_user_can_get_owned_course(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()

    monkeypatch.setattr(
        courses,
        "get_course",
        lambda _course_id: {
            "id": str(course_id),
            "user_id": "user-1",
            "name": "Artificial Intelligence",
            "code": "CSE 4308",
        },
    )

    response = client.get(
        f"/courses/{course_id}"
    )

    assert response.status_code == 200
    assert response.json()["user_id"] == "user-1"


def test_user_cannot_get_another_users_course(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()

    monkeypatch.setattr(
        courses,
        "get_course",
        lambda _course_id: {
            "id": str(course_id),
            "user_id": "user-2",
            "name": "Private Course",
            "code": None,
        },
    )

    response = client.get(
        f"/courses/{course_id}"
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Course not found."
    }


def test_course_listing_uses_authenticated_user(
    monkeypatch,
    authenticated_user,
):
    captured = {}

    def fake_list_courses(user_id):
        captured["user_id"] = user_id
        return []

    monkeypatch.setattr(
        courses,
        "list_courses",
        fake_list_courses,
    )

    response = client.get("/courses")

    assert response.status_code == 200
    assert captured["user_id"] == "user-1"
    assert response.json() == {
        "courses": []
    }


def test_course_creation_uses_authenticated_user(
    monkeypatch,
    authenticated_user,
):
    captured = {}

    def fake_create_course(
        user_id,
        name,
        code,
    ):
        captured["user_id"] = user_id
        captured["name"] = name
        captured["code"] = code

        return {
            "id": str(uuid4()),
            "user_id": user_id,
            "name": name,
            "code": code,
        }

    monkeypatch.setattr(
        courses,
        "create_course",
        fake_create_course,
    )

    response = client.post(
        "/courses",
        json={
            "name": "  Artificial Intelligence  ",
            "code": "  CSE 4308  ",
        },
    )

    assert response.status_code == 200

    assert captured == {
        "user_id": "user-1",
        "name": "Artificial Intelligence",
        "code": "CSE 4308",
    }


def test_owned_course_can_be_deleted(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()

    monkeypatch.setattr(
        courses,
        "get_course",
        lambda _course_id: {
            "id": str(course_id),
            "user_id": "user-1",
        },
    )

    monkeypatch.setattr(
        courses,
        "delete_course",
        lambda _course_id: True,
    )

    response = client.delete(
        f"/courses/{course_id}"
    )

    assert response.status_code == 200
    assert response.json()["deleted"] is True


def test_unauthenticated_document_upload_returns_401():
    course_id = uuid4()

    response = client.post(
        f"/courses/{course_id}/documents",
        files={
            "file": (
                "lecture.pdf",
                b"fake-pdf",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 401


def test_non_pdf_upload_returns_400(
    authenticated_user,
):
    course_id = uuid4()

    response = client.post(
        f"/courses/{course_id}/documents",
        files={
            "file": (
                "notes.txt",
                b"hello",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Only PDF files are supported."
    }


def test_empty_pdf_returns_400(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()

    monkeypatch.setattr(
        documents,
        "require_course_owner",
        lambda course_id, user_id: {
            "id": course_id,
            "user_id": user_id,
        },
    )

    response = client.post(
        f"/courses/{course_id}/documents",
        files={
            "file": (
                "empty.pdf",
                b"",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Uploaded file is empty."
    }


def test_owned_course_document_upload_starts_processing(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()
    document_id = str(uuid4())

    monkeypatch.setattr(
        documents,
        "require_course_owner",
        lambda course_id, user_id: {
            "id": course_id,
            "user_id": user_id,
        },
    )

    monkeypatch.setattr(
        documents,
        "create_document",
        lambda course_id, filename: document_id,
    )

    monkeypatch.setattr(
        documents,
        "process_document",
        lambda *args, **kwargs: None,
    )

    response = client.post(
        f"/courses/{course_id}/documents",
        files={
            "file": (
                "lecture.pdf",
                b"%PDF-test-data",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["document_id"] == document_id
    assert data["course_id"] == str(course_id)
    assert data["filename"] == "lecture.pdf"
    assert data["status"] == "processing"


def test_upload_to_another_users_course_returns_404(
    monkeypatch,
    authenticated_user,
):
    course_id = uuid4()

    def deny_access(course_id, user_id):
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    monkeypatch.setattr(
        documents,
        "require_course_owner",
        deny_access,
    )

    response = client.post(
        f"/courses/{course_id}/documents",
        files={
            "file": (
                "lecture.pdf",
                b"%PDF-test-data",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Course not found."
    }


def test_user_cannot_delete_another_users_document(
    monkeypatch,
    authenticated_user,
):
    document_id = uuid4()
    course_id = str(uuid4())

    monkeypatch.setattr(
        documents,
        "get_document_course_id",
        lambda _document_id: course_id,
    )

    def deny_access(course_id, user_id):
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    monkeypatch.setattr(
        documents,
        "require_course_owner",
        deny_access,
    )

    response = client.delete(
        f"/documents/{document_id}"
    )

    assert response.status_code == 404


def test_user_can_delete_owned_document(
    monkeypatch,
    authenticated_user,
):
    document_id = uuid4()
    course_id = str(uuid4())

    monkeypatch.setattr(
        documents,
        "get_document_course_id",
        lambda _document_id: course_id,
    )

    monkeypatch.setattr(
        documents,
        "require_course_owner",
        lambda course_id, user_id: {
            "id": course_id,
            "user_id": user_id,
        },
    )

    monkeypatch.setattr(
        documents,
        "delete_document",
        lambda _document_id: True,
    )

    response = client.delete(
        f"/documents/{document_id}"
    )

    assert response.status_code == 200
    assert response.json() == {
        "deleted": True,
        "document_id": str(document_id),
    }
