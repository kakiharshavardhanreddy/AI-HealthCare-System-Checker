from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import AppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models import MedicalHistory, Notification, User
from app.schemas import ForgotPasswordRequest, LoginRequest, MessageResponse, RefreshRequest, TokenPair, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _issue_tokens(user: User, db: Session) -> TokenPair:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token_hash = hash_token(refresh_token)
    user.last_login_at = datetime.now(UTC)
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenPair(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]) -> TokenPair:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise AppError("An account with this email already exists", status.HTTP_409_CONFLICT)
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(MedicalHistory(user_id=user.id))
    db.add(
        Notification(
            user_id=user.id,
            title="Welcome to HealthAI",
            message="Your secure AI health workspace is ready.",
            type="success",
        )
    )
    return _issue_tokens(user, db)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenPair:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise AppError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise AppError("This account is suspended", status.HTTP_403_FORBIDDEN)
    return _issue_tokens(user, db)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Annotated[Session, Depends(get_db)]) -> TokenPair:
    decoded = decode_refresh_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise AppError("Invalid token type", status.HTTP_401_UNAUTHORIZED)
    user = db.get(User, int(decoded["sub"]))
    if not user or not user.refresh_token_hash or user.refresh_token_hash != hash_token(payload.refresh_token):
        raise AppError("Invalid refresh token", status.HTTP_401_UNAUTHORIZED)
    return _issue_tokens(user, db)


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> MessageResponse:
    current_user.refresh_token_hash = None
    db.add(current_user)
    db.commit()
    return MessageResponse(message="Logged out successfully")


@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def forgot_password(payload: ForgotPasswordRequest, db: Annotated[Session, Depends(get_db)]) -> MessageResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user:
        db.add(
            Notification(
                user_id=user.id,
                title="Password reset requested",
                message="A reset workflow was requested for your account.",
                type="info",
            )
        )
        db.commit()
    return MessageResponse(message="If an account exists, a reset link has been sent")


@router.get("/me", response_model=UserOut)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
