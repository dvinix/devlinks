"""Tests for security utilities."""

import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_access_token,
    verify_refresh_token
)


def test_hash_password():
    """Test password hashing."""
    password = "testpassword123"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_create_access_token():
    """Test access token creation."""
    user_id = "123"
    token = create_access_token(user_id)
    
    assert token is not None
    assert isinstance(token, str)
    
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == user_id
    assert payload.get("type") == "access"


def test_create_refresh_token():
    """Test refresh token creation."""
    user_id = "123"
    token = create_refresh_token(user_id)
    
    assert token is not None
    assert isinstance(token, str)
    
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == user_id
    assert payload.get("type") == "refresh"


def test_verify_access_token():
    """Test access token verification."""
    user_id = "123"
    token = create_access_token(user_id)
    
    verified_user_id = verify_access_token(token)
    assert verified_user_id == user_id


def test_verify_refresh_token():
    """Test refresh token verification."""
    user_id = "123"
    token = create_refresh_token(user_id)
    
    verified_user_id = verify_refresh_token(token)
    assert verified_user_id == user_id


def test_verify_access_token_with_refresh_token():
    """Test that access token verification rejects refresh tokens."""
    user_id = "123"
    refresh_token = create_refresh_token(user_id)
    
    verified_user_id = verify_access_token(refresh_token)
    assert verified_user_id is None
