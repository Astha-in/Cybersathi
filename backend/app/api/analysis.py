import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.graph import cybersathi_graph
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import (
    TextAnalysisRequest,
    ThreatAnalysisResponse,
)
from app.schemas.history import AnalysisHistoryItem
from app.services.image_analysis_service import image_analysis_service


router = APIRouter(
    prefix="/analysis",
    tags=["Threat Analysis"],
)


MAX_IMAGE_SIZE = 10 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
}


def extract_urls(text: str) -> list[str]:
    pattern = r"https?://[^\s]+"
    return re.findall(pattern, text)


@router.post(
    "/text",
    response_model=ThreatAnalysisResponse,
)
def analyze_text(
    data: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        graph_state = {
            "input_text": data.text,
            "db": db,
        }

        result = cybersathi_graph.invoke(
            graph_state
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="CyberSathi analysis pipeline failed.",
        )

    indicators = result.get(
        "indicators",
        []
    )

    risk_score = result.get(
        "risk_score",
        0
    )

    risk_level = result.get(
        "risk_level",
        "low"
    )

    threat_type = result.get(
        "threat_type",
        "no_obvious_threat"
    )

    final_response = result.get(
        "final_response",
        ""
    )

    ai_analysis = result.get(
        "ai_analysis",
        ""
    )

    url_results = result.get(
        "url_results",
        []
    )

    retrieved_knowledge = result.get(
        "retrieved_knowledge",
        []
    )

    if not final_response:
        final_response = (
            "No AI assessment was generated. "
            "Please rely on the detected security "
            "indicators and risk level."
        )

    if not ai_analysis:
        ai_analysis = final_response

    recommended_action = (
        "Do not click suspicious links or "
        "provide passwords, OTPs, or other "
        "sensitive information. Verify unexpected "
        "requests through official channels."
    )

    analysis = Analysis(
        user_id=current_user.id,
        input_text=data.text,
        risk_score=risk_score,
        risk_level=risk_level,
        threat_type=threat_type,
        explanation=final_response,
        recommended_action=recommended_action,
    )

    db.add(analysis)
    db.commit()

    return ThreatAnalysisResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        threat_type=threat_type,
        indicators=indicators,
        explanation=final_response,
        recommended_action=recommended_action,
        ai_analysis=ai_analysis,
        url_results=url_results,
        retrieved_knowledge=retrieved_knowledge,
    )


@router.post("/image")
async def analyze_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image type. "
                "Use PNG, JPEG, or WEBP."
            ),
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Image file is empty.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                "Image is too large. "
                "Maximum size is 10 MB."
            ),
        )

    try:
        analysis = (
            image_analysis_service.analyze_image(
                image_bytes=image_bytes,
                mime_type=file.content_type,
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Image analysis service failed.",
        )

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "analysis": analysis,
    }


@router.get(
    "/history",
    response_model=list[AnalysisHistoryItem],
)
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(Analysis)
        .where(
            Analysis.user_id == current_user.id
        )
        .order_by(
            Analysis.created_at.desc()
        )
    )

    analyses = db.scalars(statement).all()

    return analyses