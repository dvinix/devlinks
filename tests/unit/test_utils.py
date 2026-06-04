"""Tests for URL utilities."""

import pytest
from app.utils.url import (
    generate_short_slug,
    is_valid_url,
    validate_url,
)


def test_generate_short_slug():
    """Test slug generation."""
    slug = generate_short_slug()
    
    assert isinstance(slug, str)
    assert len(slug) == 6
    
    slug_custom = generate_short_slug(length=10)
    assert len(slug_custom) == 10


def test_is_valid_url():
    """Test URL validation."""
    valid_urls = [
        "https://example.com",
        "http://localhost:3000",
        "https://example.com/path?query=value",
    ]
    
    invalid_urls = [
        "not a url",
        "localhost:3000",
        "",
    ]
    
    for url in valid_urls:
        assert is_valid_url(url), f"{url} should be valid"
    
    for url in invalid_urls:
        assert not is_valid_url(url), f"{url} should be invalid"


def test_validate_url():
    """Test URL validation with error messages."""
    is_valid, msg = validate_url("https://example.com")
    assert is_valid
    assert msg == ""
    
    is_valid, msg = validate_url("")
    assert not is_valid
    assert "empty" in msg.lower()
    
    is_valid, msg = validate_url("not a url")
    assert not is_valid
    assert "invalid" in msg.lower()
