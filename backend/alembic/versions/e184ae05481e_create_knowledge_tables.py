from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = "e184ae05481e"
down_revision: Union[str, Sequence[str], None] = "6118fd651642"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "knowledge_documents",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "source",
            sa.String(length=500),
            nullable=False,
        ),
        sa.Column(
            "document_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "knowledge_chunks",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "document_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "chunk_index",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "embedding",
            Vector(2048),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["knowledge_documents.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_knowledge_chunks_document_id",
        "knowledge_chunks",
        ["document_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_knowledge_chunks_document_id",
        table_name="knowledge_chunks",
    )

    op.drop_table("knowledge_chunks")
    op.drop_table("knowledge_documents")