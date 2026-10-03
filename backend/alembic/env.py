from logging.config import fileConfig

from sqlalchemy import create_engine
from sqlalchemy import pool

from alembic import context

from app.core.config import settings
from app.core.database import Base

# Import ALL models so Alembic autogenerate picks them up
from app.models import User, Analysis, KnowledgeDocument, KnowledgeChunk  # noqa: F401


# Alembic Config object
config = context.config


# Configure Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# SQLAlchemy metadata for Alembic autogenerate
target_metadata = Base.metadata


def _get_engine():
    """Build engine for migrations with SSL when targeting Supabase."""
    url = settings.DATABASE_URL

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

    return create_engine(
        url,
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )


def run_migrations_offline() -> None:
    """Run migrations in offline mode (generates SQL script)."""

    url = settings.DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode (connects directly to DB)."""

    connectable = _get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()