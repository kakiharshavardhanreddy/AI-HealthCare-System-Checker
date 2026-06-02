from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "HealthAI"
    api_v1_prefix: str = "/api/v1"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    database_url: str = Field(default="postgresql://user:password@localhost:5432/healthai", alias="DATABASE_URL")
    jwt_secret_key: str = Field(default="dev-secret-change-me", alias="JWT_SECRET_KEY")
    jwt_refresh_secret: str = Field(default="dev-refresh-change-me", alias="JWT_REFRESH_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    next_public_api_url: str = Field(default="http://localhost:8000", alias="NEXT_PUBLIC_API_URL")
    next_public_ws_url: str = Field(default="ws://localhost:8000", alias="NEXT_PUBLIC_WS_URL")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    ocr_api_key: str | None = Field(default=None, alias="OCR_API_KEY")
    smtp_host: str | None = Field(default=None, alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str | None = Field(default=None, alias="SMTP_USER")
    smtp_password: str | None = Field(default=None, alias="SMTP_PASSWORD")

    @property
    def cors_origins(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            self.next_public_api_url.replace(":8000", ":3000"),
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
