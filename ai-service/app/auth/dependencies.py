import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

from app.core_config import settings


jwks_client = PyJWKClient(
    f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
)


def get_current_user_id(
    authorization: str | None = Header(default=None),
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization token.",
        )

    parts = authorization.split(" ", 1)

    if (
        len(parts) != 2
        or parts[0].lower() != "bearer"
        or not parts[1]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header.",
        )

    token = parts[1]

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
            issuer=f"{settings.supabase_url}/auth/v1",
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Token does not contain a user id.",
            )

        return str(user_id)

    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Authorization token expired.",
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization token.",
        )
