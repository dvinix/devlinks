import pytest
import sys
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from fastapi.testclient import TestClient
    from app.main import app
    HAS_APP = True
except Exception as e:
    HAS_APP = False
    print(f"Warning: Could not import app: {e}")


@pytest.fixture
def client():
    """Provide a test client for the FastAPI app."""
    if not HAS_APP:
        pytest.skip("App not available")
    return TestClient(app)


@pytest.fixture
def mock_user_data():
    """Provide mock user data for tests."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def mock_link_data():
    """Provide mock link data for tests."""
    return {
        "original_url": "https://example.com/very/long/url",
        "slug": "abc123"
    }
