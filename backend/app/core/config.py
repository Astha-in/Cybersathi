from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CyberSathi"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = ""

    # Set True to force SSL even for URLs not auto-detected as remote
    DB_REQUIRE_SSL: bool = False

    # SQLAlchemy connection pool (keep low for Supabase free tier)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # ── AI ────────────────────────────────────────────────────────────────────
    OPENROUTER_API_KEY: str = ""

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Google OAuth ──────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://127.0.0.1:8000/auth/google/callback"

    # ── Frontend / CORS ───────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # Additional allowed CORS origins (comma-separated)
    EXTRA_CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_allowed_origins(self) -> list[str]:
        """Return the full list of allowed CORS origins."""
        origins = [self.FRONTEND_URL]

        # Always allow localhost variants for development convenience
        dev_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

        for origin in dev_origins:
            if origin not in origins:
                origins.append(origin)

        # Allow any extra origins defined in .env
        if self.EXTRA_CORS_ORIGINS:
            for extra in self.EXTRA_CORS_ORIGINS.split(","):
                stripped = extra.strip()
                if stripped and stripped not in origins:
                    origins.append(stripped)

        return origins


settings = Settings()