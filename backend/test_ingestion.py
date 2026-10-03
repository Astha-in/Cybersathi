from app.core.database import SessionLocal
from app.rag.ingestion import knowledge_ingestion_service


def main():
    db = SessionLocal()

    try:
        text = """
        Phishing is a type of social engineering attack where
        attackers attempt to trick users into revealing sensitive
        information such as passwords, authentication codes,
        banking information, or other credentials.

        Phishing messages commonly create a sense of urgency.
        They may ask users to click a link, verify an account,
        reset a password, or provide confidential information.

        Users should avoid clicking suspicious links and should
        verify unexpected requests through an official website
        or trusted communication channel.
        """

        document = knowledge_ingestion_service.ingest_text(
            db=db,
            title="Cybersecurity Phishing Basics",
            source="CyberSathi Test Knowledge",
            text=text,
            document_type="text",
        )

        print("Knowledge ingestion successful.")
        print(f"Document ID: {document.id}")
        print(f"Document title: {document.title}")

    except Exception as exc:
        db.rollback()
        print("Knowledge ingestion failed.")
        print(f"Error: {exc}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()