from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def _build_engine():
    """Build the SQLAlchemy engine with appropriate settings for production."""
    url = settings.DATABASE_URL

    # Detect if this is a Supabase / remote PostgreSQL URL (needs SSL)
    is_remote = (
        "supabase" in url
        or "pooler.supabase" in url
        or "neon.tech" in url
        or "render.com" in url
        or "railway.app" in url
        or settings.DB_REQUIRE_SSL
    )

    connect_args: dict = {}
    if is_remote:
        connect_args["sslmode"] = "require"

    engine = create_engine(
        url,
        # Health-check connection before using it from pool
        pool_pre_ping=True,
        # Supabase / remote PG: keep pool small to avoid exceeding limits
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        # Recycle connections every 30 minutes to prevent stale connections
        pool_recycle=1800,
        connect_args=connect_args,
    )

    return engine


engine = _build_engine()


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()