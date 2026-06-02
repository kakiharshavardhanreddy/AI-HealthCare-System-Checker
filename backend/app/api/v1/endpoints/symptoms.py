from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import FollowUpQuestion, Symptom, User
from app.schemas import FollowUpQuestionOut, SymptomCreate, SymptomOut

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


@router.get("", response_model=list[SymptomOut])
def list_symptoms(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    category: str | None = None,
    search: str | None = None,
) -> list[Symptom]:
    query = select(Symptom).order_by(Symptom.category, Symptom.name)
    if category and category.lower() != "all":
        query = query.where(Symptom.category.ilike(category))
    if search:
        query = query.where(Symptom.name.ilike(f"%{search}%"))
    return list(db.scalars(query).all())


@router.post("", response_model=SymptomOut, status_code=status.HTTP_201_CREATED)
def create_symptom(
    payload: SymptomCreate,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> Symptom:
    symptom = Symptom(**payload.model_dump())
    db.add(symptom)
    db.commit()
    db.refresh(symptom)
    return symptom


@router.get("/questions", response_model=list[FollowUpQuestionOut])
def symptom_questions(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    symptom_keys: Annotated[list[str] | None, Query()] = None,
) -> list[FollowUpQuestion]:
    query = select(FollowUpQuestion).join(Symptom).options(selectinload(FollowUpQuestion.symptom))
    if symptom_keys:
        normalized = [item.lower().replace(" ", "_") for item in symptom_keys]
        query = query.where(Symptom.feature_key.in_(normalized))
    return list(db.scalars(query.limit(14)).all())
