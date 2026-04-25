from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # PostgreSQL
    postgres_url: str = Field(alias="POSTGRES_URL")

    # MongoDB
    mongo_url: str = Field(alias="MONGO_URL")
    mongo_db_name: str = Field(default="devlinks", alias="MONGO_DB_NAME")

    # Redis
    redis_url: str = Field(alias="REDIS_URL")
    
    # JWT
    secret_key: str = Field(alias="SECRET_KEY", min_length=32)
    algorithm: str = Field(default="HS256", alias="ALGORITHM")

    # Token expiration
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")

    # Application
    app_host: str = Field(default="127.0.0.1", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    base_url: str = Field(default="http://localhost:8000", alias="BASE_URL")
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://localhost:8000",
        alias="CORS_ORIGINS"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convert comma-separated CORS origins to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()

if len(settings.secret_key) < 32:
    raise ValueError("SECRET_KEY must be at least 32 characters long")

