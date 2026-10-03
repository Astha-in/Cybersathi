from app.agents.state import CyberSathiState
from app.rag.retrieval import knowledge_retrieval_service


class RAGKnowledgeAgent:
    def retrieve(self, state: CyberSathiState) -> CyberSathiState:
        query = state.get("input_text", "").strip()

        if not query:
            state["retrieved_knowledge"] = []
            state["rag_context"] = (
                "No input was provided, so no cybersecurity "
                "knowledge was retrieved."
            )
            return state

        try:
            results = knowledge_retrieval_service.search(
                db=state["db"],
                query=query,
                top_k=3,
            )

            state["retrieved_knowledge"] = results

            if not results:
                state["rag_context"] = (
                    "No relevant cybersecurity knowledge "
                    "was retrieved."
                )
                return state

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

            state["rag_context"] = "\n\n".join(
                context_parts
            )

        except Exception as exc:
            state["retrieved_knowledge"] = []
            state["rag_context"] = (
                "Knowledge retrieval was unavailable. "
                "Continue analysis without additional "
                "knowledge."
            )
            state["error"] = str(exc)

        return state


rag_knowledge_agent = RAGKnowledgeAgent()