from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import MedicalHistory, User
from app.schemas import MedicalHistoryIn, MedicalHistoryOut

router = APIRouter(prefix="/medical-history", tags=["Medical History"])


def _get_or_create_history(db: Session, user_id: int) -> MedicalHistory:
    history = db.scalar(select(MedicalHistory).where(MedicalHistory.user_id == user_id))
    if history:
        return history
    history = MedicalHistory(user_id=user_id)
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


@router.get("", response_model=MedicalHistoryOut)
def get_medical_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MedicalHistory:
    return _get_or_create_history(db, current_user.id)


@router.put("", response_model=MedicalHistoryOut)
def upsert_medical_history(
    payload: MedicalHistoryIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MedicalHistory:
    history = _get_or_create_history(db, current_user.id)
    for key, value in payload.model_dump().items():
        setattr(history, key, value)
    db.add(history)
    db.commit()
    db.refresh(history)
    return history
