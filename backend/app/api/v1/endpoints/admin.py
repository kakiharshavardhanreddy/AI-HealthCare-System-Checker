from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.errors import AppError
from app.db.session import get_db
from app.models import Notification, Prediction, PrescriptionScan, User
from app.schemas import AdminOverview, AdminUserOut, MessageResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview", response_model=AdminOverview)
def overview(_: Annotated[User, Depends(get_current_admin)], db: Annotated[Session, Depends(get_db)]) -> AdminOverview:
    users = db.scalar(select(func.count(User.id))) or 0
    assessments = db.scalar(select(func.count(Prediction.id))) or 0
    high_risk = db.scalar(select(func.count(Prediction.id)).where(Prediction.severity == "High")) or 0
    scans = db.scalar(select(func.count(PrescriptionScan.id))) or 0
    latest = list(db.scalars(select(Notification).order_by(Notification.created_at.desc()).limit(10)).all())
    return AdminOverview(
        users=users,
        assessments=assessments,
        high_risk_alerts=high_risk,
        scans=scans,
        user_distribution=[
            {"region": "North America", "users": max(int(users * 0.36), 1)},
            {"region": "Europe", "users": max(int(users * 0.24), 1)},
            {"region": "Asia", "users": max(int(users * 0.31), 1)},
            {"region": "Other", "users": max(int(users * 0.09), 1)},
        ],
        activity=[
            {"title": item.title, "message": item.message, "type": item.type, "created_at": item.created_at.isoformat()}
            for item in latest
        ],
    )


@router.get("/users", response_model=list[AdminUserOut])
def users(
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
) -> list[User]:
    query = select(User).order_by(User.created_at.desc())
    if search:
        query = query.where((User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%")))
    return list(db.scalars(query.limit(100)).all())


@router.patch("/users/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(
    user_id: int,
    _: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> MessageResponse:
    user = db.get(User, user_id)
    if not user:
        raise AppError("User not found", status.HTTP_404_NOT_FOUND)
    user.is_active = not user.is_active
    db.add(user)
    db.commit()
    return MessageResponse(message="User status updated")


@router.get("/activity")
def activity(_: Annotated[User, Depends(get_current_admin)], db: Annotated[Session, Depends(get_db)]) -> list[dict]:
    latest = db.scalars(select(Notification).order_by(Notification.created_at.desc()).limit(25)).all()
    return [
        {"id": item.id, "title": item.title, "message": item.message, "type": item.type, "created_at": item.created_at}
        for item in latest
    ]
