from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    postgres_url: str = Field(alias="POSTGRES_URL")

    secret_key: str = Field(alias="SECRET_KEY", min_length=32)
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")


    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

if len(settings.secret_key) < 32:  ##quick validation...
    raise ValueError("SECRET_KEY must be at least 32 characters long")