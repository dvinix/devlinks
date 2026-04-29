import json
from typing import Any

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.core.config import settings


def _build_credential() -> credentials.Certificate:
    if settings.firebase_service_account_json:
        try:
            service_account_info = json.loads(settings.firebase_service_account_json)
        except json.JSONDecodeError as exc:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON") from exc

        return credentials.Certificate(service_account_info)

    if (
        settings.firebase_project_id
        and settings.firebase_client_email
        and settings.firebase_private_key
    ):
        private_key = settings.firebase_private_key.replace("\\n", "\n")
        service_account_info = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": private_key,
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        return credentials.Certificate(service_account_info)

    raise RuntimeError(
        "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or "
        "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    )


def _get_or_init_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        cred = _build_credential()
        return firebase_admin.initialize_app(cred)


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    app = _get_or_init_app()
    return firebase_auth.verify_id_token(id_token, app=app, clock_skew_seconds=10)
