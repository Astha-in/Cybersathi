from app.core.database import SessionLocal
from app.rag.retrieval import knowledge_retrieval_service


def main():
    db = SessionLocal()

    try:
        query = "How can I identify a phishing email?"

        print("Testing CyberSathi vector retrieval...")
        print(f"Query: {query}")
        print()

        results = knowledge_retrieval_service.search(
            db=db,
            query=query,
            top_k=3,
        )

        if not results:
            print("No knowledge chunks found.")
            return

        print(f"Found {len(results)} relevant chunk(s).")
        print()

        for index, result in enumerate(results, start=1):
            print(f"--- Result {index} ---")
            print(f"Chunk ID: {result['chunk_id']}")
            print(f"Similarity: {result['similarity']}")
            print(f"Content: {result['content']}")
            print()

    except Exception as exc:
        print("Retrieval failed.")
        print(f"Error: {exc}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()