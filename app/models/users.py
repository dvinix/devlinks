from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.postgres import Base



#### So, In the User Model I had created the schema of the user how the user look's like 
## in the database


class Users(Base):
    __tablename__ = "users"

    ## Primary Key --> UUID is better than integer, you can't guess the next Id

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    email  = Column(String, unique=True, nullable=False, index=True)

    hashed_password  = Column(String, nullable=False)

    plan = Column(Enum("free", "pro", name="user_plan"), default="free")

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User {self.email}>"
    