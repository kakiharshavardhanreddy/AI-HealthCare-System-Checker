from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import AppError
from app.db.session import get_db
from app.ml.model import ml_model
from app.models import Notification, Prediction, Symptom, User
from app.schemas import PredictionCreate, PredictionOut
from app.services.realtime import manager

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/analyze", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
async def analyze(
    payload: PredictionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Prediction:
    known_keys = {row[0] for row in db.execute(select(Symptom.feature_key)).all()}
    unknown = sorted(set(payload.symptom_keys) - known_keys)
    if unknown:
        raise AppError("Unknown symptoms submitted", status.HTTP_422_UNPROCESSABLE_ENTITY, {"unknown": unknown})

    result = ml_model.predict(payload.symptom_keys, payload.follow_up_answers)
    prediction = Prediction(
        user_id=current_user.id,
        patient_info=payload.patient_info.model_dump(),
        medical_history_snapshot=payload.medical_history.model_dump(),
        symptom_keys=payload.symptom_keys,
        follow_up_answers=payload.follow_up_answers,
        predicted_disease=result.predicted_disease,
        confidence=result.confidence,
        severity=result.severity,
        risk_score=result.risk_score,
        top_diseases=result.top_diseases,
        feature_importance=result.feature_importance,
        recommendations=result.recommendations,
    )
    db.add(prediction)
    db.flush()

    notification_type = "danger" if result.severity == "High" else "success"
    notification = Notification(
        user_id=current_user.id,
        title="Assessment complete" if result.severity != "High" else "High risk detected",
        message=f"{result.predicted_disease} predicted with {result.confidence:.1f}% confidence.",
        type=notification_type,
        payload={"prediction_id": prediction.id, "severity": result.severity},
    )
    db.add(notification)
    db.commit()
    db.refresh(prediction)
    await manager.send_user(
        current_user.id,
        {
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "payload": notification.payload,
        },
    )
    if result.severity == "High":
        await manager.broadcast_admin(
            {
                "title": "High risk assessment",
                "message": f"{current_user.full_name} triggered a high-risk alert.",
                "type": "danger",
                "payload": {"prediction_id": prediction.id, "user_id": current_user.id},
            }
        )
    return prediction


@router.get("", response_model=list[PredictionOut])
def list_predictions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Prediction]:
    return list(
        db.scalars(
            select(Prediction).where(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc())
        ).all()
    )


@router.get("/{prediction_id}", response_model=PredictionOut)
def get_prediction(
    prediction_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Prediction:
    prediction = db.get(Prediction, prediction_id)
    if not prediction or prediction.user_id != current_user.id:
        raise AppError("Prediction not found", status.HTTP_404_NOT_FOUND)
    return prediction
