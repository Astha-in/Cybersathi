import httpx

from app.core.config import settings


class EmbeddingService:
    """Generate vector embeddings using OpenRouter."""

    API_URL = "https://openrouter.ai/api/v1/embeddings"

    MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free"

    def __init__(self):
        if not settings.OPENROUTER_API_KEY:
            raise ValueError(
                "OPENROUTER_API_KEY is not configured."
            )

        self.api_key = settings.OPENROUTER_API_KEY

    def create_embedding(self, text: str) -> list[float]:
        """Generate a 2048-dimensional embedding for text."""

        if not text or not text.strip():
            raise ValueError(
                "Text cannot be empty."
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.MODEL,
            "input": text,
        }

        response = httpx.post(
            self.API_URL,
            headers=headers,
            json=payload,
            timeout=60.0,
        )

        response.raise_for_status()

        data = response.json()

        embedding = data["data"][0]["embedding"]

        if len(embedding) != 2048:
            raise ValueError(
                f"Unexpected embedding dimension: "
                f"{len(embedding)}. Expected 2048."
            )

        return embedding


embedding_service = EmbeddingService()