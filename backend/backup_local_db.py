"""
Backup local PostgreSQL data to JSON before migration to Supabase.
"""
import json
from app.core.database import engine
from sqlalchemy import text

data = {}

with engine.connect() as conn:
    # Export users (safe fields)
    users = conn.execute(
        text("SELECT id, name, email, google_id, auth_provider, avatar_url, created_at FROM users ORDER BY id")
    ).all()
    data["users"] = [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "google_id": r[3],
            "auth_provider": r[4],
            "avatar_url": r[5],
            "created_at": str(r[6]),
        }
        for r in users
    ]

    # Export password_hashes separately (for local auth users)
    pw_hashes = conn.execute(
        text("SELECT id, password_hash FROM users WHERE password_hash IS NOT NULL ORDER BY id")
    ).all()
    data["password_hashes"] = [{"id": r[0], "hash": r[1]} for r in pw_hashes]

    # Export analyses
    analyses = conn.execute(
        text(
            "SELECT id, user_id, input_text, risk_score, risk_level, "
            "threat_type, explanation, recommended_action, created_at "
            "FROM analyses ORDER BY id"
        )
    ).all()
    data["analyses"] = [
        {
            "id": r[0],
            "user_id": r[1],
            "input_text": r[2],
            "risk_score": r[3],
            "risk_level": r[4],
            "threat_type": r[5],
            "explanation": r[6],
            "recommended_action": r[7],
            "created_at": str(r[8]),
        }
        for r in analyses
    ]

    # Export knowledge_documents
    docs = conn.execute(
        text("SELECT id, title, source, document_type, created_at FROM knowledge_documents ORDER BY id")
    ).all()
    data["knowledge_documents"] = [
        {
            "id": r[0],
            "title": r[1],
            "source": r[2],
            "document_type": r[3],
            "created_at": str(r[4]),
        }
        for r in docs
    ]

    # Export knowledge_chunks with embeddings
    chunks = conn.execute(
        text(
            "SELECT id, document_id, chunk_index, content, embedding::text, created_at "
            "FROM knowledge_chunks ORDER BY id"
        )
    ).all()
    data["knowledge_chunks"] = [
        {
            "id": r[0],
            "document_id": r[1],
            "chunk_index": r[2],
            "content": r[3],
            "embedding": r[4],
            "created_at": str(r[5]),
        }
        for r in chunks
    ]

with open("local_db_backup.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Backup created: local_db_backup.json")
print("users:", len(data["users"]))
print("analyses:", len(data["analyses"]))
print("knowledge_documents:", len(data["knowledge_documents"]))
print("knowledge_chunks:", len(data["knowledge_chunks"]))
