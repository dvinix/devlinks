from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.postgres import Base
from app.models.users import Users


class Link(Base):
    __tablename__ = "links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ## Foreign Key to User --> Link 
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    original_url  = Column(String, nullable=False)

    slug  = Column(String, unique=True, nullable=False, index=True) ## or_url cnv to SLUG

    is_custom_slug = Column(Boolean, default=False)  ## user pick custom slug or auto_generated

    expires_at = Column(DateTime(timezone=True), nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Link {self.slug} -> {self.original_url[:50]}>"

