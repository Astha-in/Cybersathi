"""
CyberSathi Data Migration Script
=================================
Restores data from local_db_backup.json into Supabase PostgreSQL.

Usage:
    1. Set DATABASE_URL in .env to your Supabase connection string
    2. Run: python migrate_to_supabase.py

Requirements:
    - Alembic migrations must already be applied to Supabase (alembic upgrade head)
    - local_db_backup.json must exist in the same directory
"""

import json
import sys
from pathlib import Path
from sqlalchemy import create_engine, text


BACKUP_FILE = Path(__file__).parent / "local_db_backup.json"


def load_backup() -> dict:
    if not BACKUP_FILE.exists():
        print(f"ERROR: Backup file not found: {BACKUP_FILE}")
        sys.exit(1)

    with open(BACKUP_FILE, encoding="utf-8") as f:
        data = json.load(f)

    print(f"Backup loaded from {BACKUP_FILE}")
    return data


def build_engine():
    # Import settings after any env loading
    from app.core.config import settings

    url = settings.DATABASE_URL
    if not url:
        print("ERROR: DATABASE_URL is not set in .env")
        sys.exit(1)

    is_remote = (
        "supabase" in url
        or "pooler.supabase" in url
        or settings.DB_REQUIRE_SSL
    )

    connect_args: dict = {}
    if is_remote:
        connect_args["sslmode"] = "require"

    return create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )


def verify_target_is_supabase(engine) -> bool:
    """Warn if we appear to be targeting local Docker DB."""
    url_str = str(engine.url)
    if "localhost" in url_str or "127.0.0.1" in url_str:
        print(
            "\nWARNING: DATABASE_URL points to localhost. "
            "This script is meant to migrate TO Supabase, not FROM it.\n"
            "If you intended to target Supabase, update your .env DATABASE_URL.\n"
        )
        confirm = input("Continue anyway? (yes/no): ").strip().lower()
        if confirm != "yes":
            print("Migration aborted.")
            sys.exit(0)
    return True


def migrate(engine, data: dict):
    with engine.begin() as conn:
        print("\nChecking target database tables...")
        tables = conn.execute(
            text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' "
                "ORDER BY tablename"
            )
        ).scalars().all()
        print(f"  Tables found: {tables}")

        # ── users ──────────────────────────────────────────────────────────────
        existing_users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        print(f"\nMigrating users... (target currently has {existing_users})")

        ph_map = {r["id"]: r["hash"] for r in data.get("password_hashes", [])}

        for u in data["users"]:
            ph = ph_map.get(u["id"])
            conn.execute(
                text(
                    """
                    INSERT INTO users (id, name, email, google_id, auth_provider,
                                       avatar_url, password_hash, created_at)
                    VALUES (:id, :name, :email, :google_id, :auth_provider,
                            :avatar_url, :password_hash, :created_at)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        google_id = EXCLUDED.google_id,
                        auth_provider = EXCLUDED.auth_provider,
                        avatar_url = EXCLUDED.avatar_url,
                        password_hash = EXCLUDED.password_hash,
                        created_at = EXCLUDED.created_at
                    """
                ),
                {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "google_id": u.get("google_id"),
                    "auth_provider": u.get("auth_provider", "local"),
                    "avatar_url": u.get("avatar_url"),
                    "password_hash": ph,
                    "created_at": u["created_at"],
                },
            )
        print(f"  Migrated {len(data['users'])} users.")

        # Sync users sequence
        conn.execute(
            text(
                "SELECT setval('users_id_seq', "
                "(SELECT MAX(id) FROM users))"
            )
        )

        # ── analyses ───────────────────────────────────────────────────────────
        existing_analyses = conn.execute(
            text("SELECT COUNT(*) FROM analyses")
        ).scalar()
        print(f"\nMigrating analyses... (target currently has {existing_analyses})")

        for a in data["analyses"]:
            conn.execute(
                text(
                    """
                    INSERT INTO analyses (id, user_id, input_text, risk_score,
                                          risk_level, threat_type, explanation,
                                          recommended_action, created_at)
                    VALUES (:id, :user_id, :input_text, :risk_score,
                            :risk_level, :threat_type, :explanation,
                            :recommended_action, :created_at)
                    ON CONFLICT (id) DO UPDATE SET
                        user_id = EXCLUDED.user_id,
                        input_text = EXCLUDED.input_text,
                        risk_score = EXCLUDED.risk_score,
                        risk_level = EXCLUDED.risk_level,
                        threat_type = EXCLUDED.threat_type,
                        explanation = EXCLUDED.explanation,
                        recommended_action = EXCLUDED.recommended_action,
                        created_at = EXCLUDED.created_at
                    """
                ),
                {
                    "id": a["id"],
                    "user_id": a["user_id"],
                    "input_text": a["input_text"],
                    "risk_score": a["risk_score"],
                    "risk_level": a["risk_level"],
                    "threat_type": a["threat_type"],
                    "explanation": a["explanation"],
                    "recommended_action": a["recommended_action"],
                    "created_at": a["created_at"],
                },
            )
        print(f"  Migrated {len(data['analyses'])} analyses.")

        # Sync analyses sequence
        conn.execute(
            text(
                "SELECT setval('analyses_id_seq', "
                "(SELECT MAX(id) FROM analyses))"
            )
        )

        # ── knowledge_documents ────────────────────────────────────────────────
        print(f"\nMigrating knowledge_documents...")

        for d in data["knowledge_documents"]:
            conn.execute(
                text(
                    """
                    INSERT INTO knowledge_documents (id, title, source, document_type, created_at)
                    VALUES (:id, :title, :source, :document_type, :created_at)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        source = EXCLUDED.source,
                        document_type = EXCLUDED.document_type,
                        created_at = EXCLUDED.created_at
                    """
                ),
                {
                    "id": d["id"],
                    "title": d["title"],
                    "source": d["source"],
                    "document_type": d.get("document_type", "text"),
                    "created_at": d["created_at"],
                },
            )
        print(f"  Migrated {len(data['knowledge_documents'])} documents.")

        if data["knowledge_documents"]:
            conn.execute(
                text(
                    "SELECT setval('knowledge_documents_id_seq', "
                    "(SELECT MAX(id) FROM knowledge_documents))"
                )
            )

        # ── knowledge_chunks ───────────────────────────────────────────────────
        print(f"\nMigrating knowledge_chunks (with embeddings)...")

        for c in data["knowledge_chunks"]:
            # Embedding is stored as PostgreSQL vector text like '[0.1,0.2,...]'
            embedding_text = c["embedding"]

            conn.execute(
                text(
                    """
                    INSERT INTO knowledge_chunks (id, document_id, chunk_index,
                                                   content, embedding, created_at)
                    VALUES (:id, :document_id, :chunk_index,
                            :content, :embedding::vector, :created_at)
                    ON CONFLICT (id) DO UPDATE SET
                        document_id = EXCLUDED.document_id,
                        chunk_index = EXCLUDED.chunk_index,
                        content = EXCLUDED.content,
                        embedding = EXCLUDED.embedding,
                        created_at = EXCLUDED.created_at
                    """
                ),
                {
                    "id": c["id"],
                    "document_id": c["document_id"],
                    "chunk_index": c["chunk_index"],
                    "content": c["content"],
                    "embedding": embedding_text,
                    "created_at": c["created_at"],
                },
            )
        print(f"  Migrated {len(data['knowledge_chunks'])} chunks.")

        if data["knowledge_chunks"]:
            conn.execute(
                text(
                    "SELECT setval('knowledge_chunks_id_seq', "
                    "(SELECT MAX(id) FROM knowledge_chunks))"
                )
            )


def verify(engine, data: dict):
    print("\n── Verification ────────────────────────────────")
    with engine.connect() as conn:
        for table, expected in [
            ("users", len(data["users"])),
            ("analyses", len(data["analyses"])),
            ("knowledge_documents", len(data["knowledge_documents"])),
            ("knowledge_chunks", len(data["knowledge_chunks"])),
        ]:
            actual = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            status = "OK" if actual >= expected else "MISMATCH"
            print(f"  {table}: {actual} rows (expected >={expected}) [{status}]")

        # Verify vector dimension
        dim = conn.execute(
            text(
                "SELECT array_length(embedding::real[], 1) "
                "FROM knowledge_chunks LIMIT 1"
            )
        ).scalar()
        dim_status = "OK" if dim == 2048 else f"WRONG (got {dim})"
        print(f"  vector dimension: {dim} [{dim_status}]")

    print("\nMigration complete.")


if __name__ == "__main__":
    print("CyberSathi → Supabase Data Migration")
    print("=" * 40)

    data = load_backup()
    engine = build_engine()
    verify_target_is_supabase(engine)

    print(f"\nTarget DB: {str(engine.url).split('@')[-1]}")

    migrate(engine, data)
    verify(engine, data)
