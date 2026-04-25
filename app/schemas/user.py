from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional



## He is Just a Client for me... 
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, description="Password must be at least 6 characters")

    class Config:
        json_schema = {
            "example" :{
                "email": "user@example.com",
                "password": "strognpassword123"
            }
        } 


class UserLogin(BaseModel):
    email: EmailStr
    password: str



## Token milega login krne ke baad...
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

##  JabhaScript 
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    plan: str
    is_active: bool
    created_at: datetime

    class Config: 
        from_attributes = True 