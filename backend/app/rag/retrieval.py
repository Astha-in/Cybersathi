from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge import KnowledgeChunk
from app.services.embedding_service import embedding_service


class KnowledgeRetrievalService:
    """Retrieve the most relevant cybersecurity knowledge using pgvector."""

    def search(
        self,
        db: Session,
        query: str,
        top_k: int = 5,
    ) -> list[dict]:
        """Find the most semantically similar knowledge chunks."""

        if not query or not query.strip():
            raise ValueError(
                "Search query cannot be empty."
            )

        if top_k < 1:
            raise ValueError(
                "top_k must be at least 1."
            )

        query_embedding = (
            embedding_service.create_embedding(query)
        )

        distance = KnowledgeChunk.embedding.cosine_distance(
            query_embedding
        )

        statement = (
            select(
                KnowledgeChunk.id,
                KnowledgeChunk.document_id,
                KnowledgeChunk.chunk_index,
                KnowledgeChunk.content,
                distance.label("distance"),
            )
            .order_by(distance)
            .limit(top_k)
        )

        results = db.execute(statement).all()

        return [
            {
                "chunk_id": row.id,
                "document_id": row.document_id,
                "chunk_index": row.chunk_index,
                "content": row.content,
                "similarity": round(
                    max(0.0, 1.0 - float(row.distance)),
                    4,
                ),
            }
            for row in results
        ]


knowledge_retrieval_service = KnowledgeRetrievalService()