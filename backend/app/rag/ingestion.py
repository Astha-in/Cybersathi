from sqlalchemy.orm import Session

from app.models.knowledge import (
    KnowledgeChunk,
    KnowledgeDocument,
)
from app.services.embedding_service import embedding_service


class KnowledgeIngestionService:
    """Convert cybersecurity knowledge into searchable vector chunks."""

    CHUNK_SIZE = 800
    CHUNK_OVERLAP = 100

    def _split_text(self, text: str) -> list[str]:
        """Split text into overlapping chunks."""

        cleaned_text = " ".join(
            text.split()
        ).strip()

        if not cleaned_text:
            return []

        chunks = []
        start = 0
        text_length = len(cleaned_text)

        while start < text_length:
            end = min(
                start + self.CHUNK_SIZE,
                text_length,
            )

            chunk = cleaned_text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            if end >= text_length:
                break

            start = end - self.CHUNK_OVERLAP

        return chunks

    def ingest_text(
        self,
        db: Session,
        title: str,
        source: str,
        text: str,
        document_type: str = "text",
    ) -> KnowledgeDocument:
        """
        Store a document and its vectorized chunks.
        """

        if not text or not text.strip():
            raise ValueError(
                "Knowledge text cannot be empty."
            )

        chunks = self._split_text(text)

        if not chunks:
            raise ValueError(
                "No usable text was found."
            )

        document = KnowledgeDocument(
            title=title,
            source=source,
            document_type=document_type,
        )

        db.add(document)
        db.flush()

        for index, chunk_text in enumerate(chunks):
            embedding = (
                embedding_service.create_embedding(
                    chunk_text
                )
            )

            chunk = KnowledgeChunk(
                document_id=document.id,
                chunk_index=index,
                content=chunk_text,
                embedding=embedding,
            )

            db.add(chunk)

        db.commit()
        db.refresh(document)

        return document


knowledge_ingestion_service = KnowledgeIngestionService()