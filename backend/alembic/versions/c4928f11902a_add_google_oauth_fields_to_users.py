"""add google oauth fields to users

Revision ID: c4928f11902a
Revises: e184ae05481e
Create Date: 2026-10-02 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c4928f11902a"
down_revision: Union[str, Sequence[str], None] = "e184ae05481e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add google_id column and unique index
    op.add_column("users", sa.Column("google_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_users_google_id"), "users", ["google_id"], unique=True)

    # 2. Add auth_provider column with default 'local'
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(length=50),
            server_default="local",
            nullable=False,
        ),
    )

    # 3. Add avatar_url column
    op.add_column("users", sa.Column("avatar_url", sa.String(length=512), nullable=True))

    # 4. Make password_hash nullable for OAuth-created users
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "auth_provider")
    op.drop_index(op.f("ix_users_google_id"), table_name="users")
    op.drop_column("users", "google_id")
