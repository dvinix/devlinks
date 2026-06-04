from typing import TypeVar, Generic, List
from pydantic import BaseModel


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    
    items: List[T]
    total: int
    skip: int
    limit: int
    
    @property
    def total_pages(self) -> int:
        """Calculate total pages."""
        return (self.total + self.limit - 1) // self.limit
