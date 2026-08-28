import pytest
from fastapi import HTTPException

from app.auth import dependencies


def test_missing_authorization_header_returns_401():
    with pytest.raises(HTTPException) as exc:
        dependencies.get_current_user_id(None)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Missing authorization token."


def test_malformed_authorization_header_returns_401():
    with pytest.raises(HTTPException) as exc:
        dependencies.get_current_user_id(
            "not-a-bearer-token"
        )

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid authorization header."


def test_invalid_jwt_returns_401(monkeypatch):
    def raise_invalid_token(_token):
        raise ValueError("invalid token")

    monkeypatch.setattr(
        dependencies.jwks_client,
        "get_signing_key_from_jwt",
        raise_invalid_token,
    )

    with pytest.raises(HTTPException) as exc:
        dependencies.get_current_user_id(
            "Bearer invalid-token"
        )

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid authorization token."


def test_valid_jwt_returns_user_id(monkeypatch):
    class FakeSigningKey:
        key = "fake-public-key"

    monkeypatch.setattr(
        dependencies.jwks_client,
        "get_signing_key_from_jwt",
        lambda _token: FakeSigningKey(),
    )

    monkeypatch.setattr(
        dependencies.jwt,
        "decode",
        lambda *args, **kwargs: {
            "sub": "user-123",
        },
    )

    user_id = dependencies.get_current_user_id(
        "Bearer valid-token"
    )

    assert user_id == "user-123"
