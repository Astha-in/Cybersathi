from sqlalchemy.orm import Session

from app.rag.retrieval import knowledge_retrieval_service


class RAGContextService:
    """Build trusted knowledge context for AI analysis."""

    def build_context(
        self,
        db: Session,
        query: str,
        top_k: int = 3,
    ) -> str:
        """Retrieve relevant knowledge and format it for the AI."""

        results = knowledge_retrieval_service.search(
            db=db,
            query=query,
            top_k=top_k,
        )

        if not results:
            return (
                "No relevant cybersecurity knowledge "
                "was retrieved."
            )

        context_parts = []

        for index, result in enumerate(
            results,
            start=1,
        ):
            context_parts.append(
                f"""
KNOWLEDGE SOURCE {index}

Similarity:
{result["similarity"]}

Content:
{result["content"]}
""".strip()
            )

        return "\n\n".join(context_parts)


rag_context_service = RAGContextService()