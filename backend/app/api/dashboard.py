from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.analysis import Analysis
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_analyses = db.scalar(
        select(func.count(Analysis.id)).where(
            Analysis.user_id == current_user.id
        )
    ) or 0

    low_risk = db.scalar(
        select(func.count(Analysis.id)).where(
            Analysis.user_id == current_user.id,
            Analysis.risk_level == "low",
        )
    ) or 0

    medium_risk = db.scalar(
        select(func.count(Analysis.id)).where(
            Analysis.user_id == current_user.id,
            Analysis.risk_level == "medium",
        )
    ) or 0

    high_risk = db.scalar(
        select(func.count(Analysis.id)).where(
            Analysis.user_id == current_user.id,
            Analysis.risk_level == "high",
        )
    ) or 0

    critical_risk = db.scalar(
        select(func.count(Analysis.id)).where(
            Analysis.user_id == current_user.id,
            Analysis.risk_level == "critical",
        )
    ) or 0

    return {
        "total_analyses": total_analyses,
        "low_risk": low_risk,
        "medium_risk": medium_risk,
        "high_risk": high_risk,
        "critical_risk": critical_risk,
    }