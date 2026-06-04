import string
import random
from urllib.parse import urlparse


def generate_short_slug(length: int = 6) -> str:
    """
    Generate a random short slug for URL shortening.
    
    Args:
        length: Length of the slug (default: 6)
    
    Returns:
        Random slug string
    """
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def is_valid_url(url: str) -> bool:
    """
    Validate if a string is a valid URL.
    
    Args:
        url: URL string to validate
    
    Returns:
        True if valid URL, False otherwise
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def validate_url(url: str) -> tuple[bool, str]:
    """
    Validate URL with error message.
    
    Args:
        url: URL to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not url or len(url.strip()) == 0:
        return False, "URL cannot be empty"
    
    if len(url) > 2048:
        return False, "URL is too long (max 2048 characters)"
    
    if not is_valid_url(url):
        return False, "Invalid URL format"
    
    return True, ""
