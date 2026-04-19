from pydantic import BaseModel, HttpUrl 
from typing import Optional
from datetime import datetime
from uuid import UUID


## httpUr l --> Pydantic validates it's a real URL , if not rerturns 422 
class LinkCreate(BaseModel):
    original_url: HttpUrl
    custom_slug: Optional[str] = None
    expires_at: Optional[datetime] = None


class LinkResponse(BaseModel):
    id: UUID
    original_url: HttpUrl
    slug: str
    short_url: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True