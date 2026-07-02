from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


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
    base_url: str = Field( alias="BASE_URL")
    
    # CORS
    cors_origins: str = Field(
        default="https://devlinks-delta-fawn.vercel.app",
        alias="CORS_ORIGINS"
    )

    # Firebase (Optional)
    firebase_service_account_json: Optional[str] = Field(default=None, alias="FIREBASE_SERVICE_ACCOUNT_JSON")
    firebase_project_id: Optional[str] = Field(default=None, alias="FIREBASE_PROJECT_ID")
    firebase_client_email: Optional[str] = Field(default=None, alias="FIREBASE_CLIENT_EMAIL")
    firebase_private_key: Optional[str] = Field(default=None, alias="FIREBASE_PRIVATE_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env
    
    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")

    @property
    def cors_origins_list(self) -> list[str]:
        """Convert comma-separated CORS origins to list, always adding localhost in dev."""
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        
        # Always allow localhost in non-production environments
        if self.environment != "production":
            local_origins = [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
            ]
            for o in local_origins:
                if o not in origins:
                    origins.append(o)
        
        return origins


settings = Settings()

if len(settings.secret_key) < 32:
    raise ValueError("SECRET_KEY must be at least 32 characters long")
