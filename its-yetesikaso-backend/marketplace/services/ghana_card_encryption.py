from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def get_ghana_card_cipher():
    key = settings.GHANA_CARD_ENCRYPTION_KEY

    if not key:
        raise RuntimeError(
            "GHANA_CARD_ENCRYPTION_KEY is not configured."
        )

    try:
        return Fernet(key.encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise RuntimeError(
            "GHANA_CARD_ENCRYPTION_KEY is invalid."
        ) from exc


def encrypt_ghana_card_value(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("A Ghana Card value is required.")

    cipher = get_ghana_card_cipher()

    return cipher.encrypt(
        value.strip().encode("utf-8")
    ).decode("utf-8")


def decrypt_ghana_card_value(encrypted_value):
    if not encrypted_value:
        raise ValueError("No encrypted Ghana Card value was supplied.")

    cipher = get_ghana_card_cipher()

    try:
        return cipher.decrypt(
            encrypted_value.encode("utf-8")
        ).decode("utf-8")
    except (InvalidToken, UnicodeDecodeError) as exc:
        raise ValueError(
            "The Ghana Card value could not be decrypted."
        ) from exc