from app.core.database import SessionLocal
from app.rag.context import rag_context_service


def main():
    db = SessionLocal()

    try:
        query = "How can I identify a phishing email?"

        print("Testing CyberSathi RAG Context Service...")
        print(f"Query: {query}")
        print()

        context = rag_context_service.build_context(
            db=db,
            query=query,
            top_k=3,
        )

        print("RAG context generated successfully.")
        print()
        print(context)

    except Exception as exc:
        print("RAG context generation failed.")
        print(f"Error: {exc}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()