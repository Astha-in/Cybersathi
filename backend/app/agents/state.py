from typing import Any, TypedDict


class CyberSathiState(TypedDict, total=False):
    input_text: str
    input_type: str

    indicators: list[dict[str, Any]]
    url_results: list[dict[str, Any]]

    risk_score: int
    risk_level: str
    threat_type: str

    retrieved_knowledge: list[dict[str, Any]]
    rag_context: str

    ai_analysis: str
    final_response: str

    image_bytes: bytes
    image_mime_type: str

    error: str

    db: Any