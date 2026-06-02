from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Prediction, Report, User
from app.schemas import DashboardCharts, DashboardOverview, PredictionOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
def overview(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> DashboardOverview:
    predictions = list(db.scalars(select(Prediction).where(Prediction.user_id == current_user.id)).all())
    reports = db.scalars(select(Report).where(Report.user_id == current_user.id)).all()
    total = len(predictions)
    avg_conf = round(sum(item.confidence for item in predictions) / max(total, 1), 1)
    high = sum(1 for item in predictions if item.severity == "High")
    return DashboardOverview(
        total_assessments=total,
        average_confidence=avg_conf,
        high_risk_count=high,
        reports_generated=len(list(reports)),
        trends={"assessments": 12.4, "confidence": 3.2, "risk": -4.8, "reports": 9.1},
    )


@router.get("/history", response_model=list[PredictionOut])
def history(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> list[Prediction]:
    return list(
        db.scalars(
            select(Prediction).where(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc())
        ).all()
    )


@router.get("/charts", response_model=DashboardCharts)
def charts(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> DashboardCharts:
    predictions = list(db.scalars(select(Prediction).where(Prediction.user_id == current_user.id)).all())
    symptoms = Counter(symptom for prediction in predictions for symptom in prediction.symptom_keys)
    diseases = Counter(prediction.predicted_disease for prediction in predictions)

    now = datetime.now(UTC).date()
    risk_trend = []
    for day in range(30):
        date = now - timedelta(days=29 - day)
        daily = [item for item in predictions if item.created_at.date() == date]
        risk_trend.append(
            {
                "date": date.isoformat(),
                "risk": round(sum(item.risk_score for item in daily) / max(len(daily), 1), 1) if daily else 0,
            }
        )

    weekly_counts: dict[str, int] = defaultdict(int)
    for prediction in predictions:
        week = prediction.created_at.strftime("W%U")
        weekly_counts[week] += 1

    return DashboardCharts(
        symptom_frequency=[{"symptom": key, "count": value} for key, value in symptoms.most_common(10)],
        disease_distribution=[{"name": key, "value": value} for key, value in diseases.most_common(8)],
        risk_trend=risk_trend,
        weekly_activity=[{"week": key, "assessments": value} for key, value in sorted(weekly_counts.items())[-8:]],
    )
