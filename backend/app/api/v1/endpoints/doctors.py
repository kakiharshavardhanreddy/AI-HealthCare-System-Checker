from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Doctor, User
from app.schemas import DoctorCreate, DoctorOut

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=list[DoctorOut])
def doctors(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    specialty: str | None = None,
) -> list[Doctor]:
    query = select(Doctor).order_by(Doctor.rating.desc())
    if specialty:
        filtered = list(db.scalars(query.where(Doctor.specialty.ilike(f"%{specialty}%"))).all())
        if filtered:
            return filtered
    return list(db.scalars(query).all())


@router.post("", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: DoctorCreate,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> Doctor:
    doctor = Doctor(**payload.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor
