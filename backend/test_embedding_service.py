from app.services.embedding_service import embedding_service


def main():
    text = (
        "Phishing emails often use urgency and fake "
        "account verification requests to trick users."
    )

    print("Testing CyberSathi EmbeddingService...")

    embedding = embedding_service.create_embedding(text)

    print("Embedding generated successfully.")
    print(f"Vector dimension: {len(embedding)}")
    print(f"First 5 values: {embedding[:5]}")


if __name__ == "__main__":
    main()