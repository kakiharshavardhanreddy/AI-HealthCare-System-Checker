from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import AppError
from app.db.session import get_db
from app.models import Notification, Prediction, Report, User
from app.schemas import MessageResponse, ReportCreate, ReportOut
from app.services.reports import build_report_payload, render_report_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Report:
    prediction = db.get(Prediction, payload.prediction_id)
    if not prediction or prediction.user_id != current_user.id:
        raise AppError("Prediction not found", status.HTTP_404_NOT_FOUND)
    report = Report(
        user_id=current_user.id,
        prediction_id=prediction.id,
        title=f"Health Assessment Report - {prediction.predicted_disease}",
        report_data=build_report_payload(current_user, prediction),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[ReportOut])
def list_reports(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Report]:
    return list(
        db.scalars(select(Report).where(Report.user_id == current_user.id).order_by(Report.created_at.desc())).all()
    )


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Report:
    report = db.get(Report, report_id)
    if not report or report.user_id != current_user.id:
        raise AppError("Report not found", status.HTTP_404_NOT_FOUND)
    return report


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    report = db.get(Report, report_id)
    if not report or report.user_id != current_user.id:
        raise AppError("Report not found", status.HTTP_404_NOT_FOUND)
    pdf_bytes = render_report_pdf(report.report_data)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=healthai-report-{report.id}.pdf"},
    )


@router.post("/{report_id}/email", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def email_report(
    report_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MessageResponse:
    report = db.get(Report, report_id)
    if not report or report.user_id != current_user.id:
        raise AppError("Report not found", status.HTTP_404_NOT_FOUND)
    db.add(
        Notification(
            user_id=current_user.id,
            title="Report email queued",
            message=f"{report.title} has been queued for email delivery.",
            type="success",
            payload={"report_id": report.id},
        )
    )
    db.commit()
    return MessageResponse(message="Report email queued")
