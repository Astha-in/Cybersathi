from typing import Any, Literal

from pydantic import BaseModel, Field


class TextAnalysisRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=10000,
    )


class ThreatIndicator(BaseModel):
    type: str
    description: str
    severity: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]


class URLAnalysisResult(BaseModel):
    url: str
    risk_score: int = Field(
        ge=0,
        le=100,
    )
    risk_level: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]
    indicators: list[dict[str, Any]] = []


class RAGKnowledgeResult(BaseModel):
    chunk_id: int
    document_id: int
    chunk_index: int
    content: str
    similarity: float = Field(
        ge=0,
        le=1,
    )


class ThreatAnalysisResponse(BaseModel):
    risk_score: int = Field(
        ge=0,
        le=100,
    )

    risk_level: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ]

    threat_type: str

    indicators: list[ThreatIndicator]

    explanation: str

    recommended_action: str

    ai_analysis: str = ""

    url_results: list[URLAnalysisResult] = []

    retrieved_knowledge: list[RAGKnowledgeResult] = []