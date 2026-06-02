from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import ChatHistory, User
from app.schemas import ChatMessageOut, ChatMessageRequest, ChatResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def message(
    payload: ChatMessageRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ChatResponse:
    user_message = ChatHistory(
        user_id=current_user.id,
        session_id=payload.session_id,
        role="user",
        content=payload.message,
    )
    answer, safety_level = _assistant_answer(payload.message)
    assistant_message = ChatHistory(
        user_id=current_user.id,
        session_id=payload.session_id,
        role="assistant",
        content=answer,
    )
    db.add_all([user_message, assistant_message])
    db.commit()
    messages = list(
        db.scalars(
            select(ChatHistory)
            .where(ChatHistory.user_id == current_user.id, ChatHistory.session_id == payload.session_id)
            .order_by(ChatHistory.created_at)
        ).all()
    )
    return ChatResponse(
        session_id=payload.session_id,
        answer=answer,
        safety_level=safety_level,
        messages=[ChatMessageOut.model_validate(item) for item in messages],
    )


@router.get("/history", response_model=list[ChatMessageOut])
def history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    session_id: str | None = None,
) -> list[ChatHistory]:
    query = select(ChatHistory).where(ChatHistory.user_id == current_user.id)
    if session_id:
        query = query.where(ChatHistory.session_id == session_id)
    return list(db.scalars(query.order_by(ChatHistory.created_at.desc()).limit(100)).all())


def _assistant_answer(message: str) -> tuple[str, str]:
    lowered = message.lower()
    emergency_terms = ["chest pain", "stroke", "faint", "cannot breathe", "severe bleeding", "suicidal"]
    doctor_terms = ["fever", "infection", "worse", "persistent", "dizzy", "shortness of breath"]
    if any(term in lowered for term in emergency_terms):
        return (
            "This may be urgent. Please seek immediate medical attention or call your local emergency number now. I can help you organize symptoms, but I cannot replace emergency care.",
            "urgent",
        )
    if any(term in lowered for term in doctor_terms):
        return (
            "Your symptoms deserve clinician review, especially if they are worsening or lasting more than 24 to 48 hours. Track severity, temperature, medications, and hydration while you arrange care.",
            "doctor",
        )
    return (
        "I can help you think through symptoms and next steps. Share when it started, severity from 1 to 10, related symptoms, and any medical history. This guidance is informational only.",
        "self_care",
    )
