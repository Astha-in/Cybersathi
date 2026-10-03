import httpx

from app.core.config import settings


API_URL = "https://openrouter.ai/api/v1/embeddings"

MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free"


def main():
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not configured."
        )

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "input": "Phishing emails often use urgency to trick users.",
    }

    print("Testing OpenRouter embedding API...")
    print(f"Model: {MODEL}")

    response = httpx.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=60.0,
    )

    print(f"HTTP status: {response.status_code}")

    response.raise_for_status()

    data = response.json()

    embedding = data["data"][0]["embedding"]

    print("Embedding request successful.")
    print(f"Vector dimension: {len(embedding)}")


if __name__ == "__main__":
    main()