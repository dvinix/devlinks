from typing import Any, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
) -> dict:
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Formatted response dictionary
    """
    return {
        "success": True,
        "status_code": status_code,
        "message": message,
        "data": data,
    }


def error_response(
    message: str = "An error occurred",
    error_code: Optional[str] = None,
    status_code: int = 400,
    details: Optional[Any] = None
) -> dict:
    """
    Create a standardized error response.
    
    Args:
        message: Error message
        error_code: Error code identifier
        status_code: HTTP status code
        details: Additional error details
    
    Returns:
        Formatted error response dictionary
    """
    return {
        "success": False,
        "status_code": status_code,
        "message": message,
        "error_code": error_code,
        "details": details,
    }
