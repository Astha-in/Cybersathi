from datetime import datetime

from pydantic import BaseModel, Field


class AnalysisHistoryItem(BaseModel):
    id: int
    risk_score: int = Field(ge=0, le=100)
    risk_level: str
    threat_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }