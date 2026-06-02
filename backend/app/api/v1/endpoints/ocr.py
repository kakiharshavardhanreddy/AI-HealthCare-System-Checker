from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import AppError
from app.db.session import get_db
from app.models import PrescriptionScan, ScanStatus, User
from app.schemas import PrescriptionScanOut
from app.services.ocr import extract_prescription

router = APIRouter(prefix="/ocr", tags=["OCR"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "application/pdf", "text/plain"}


@router.post("/scan", response_model=PrescriptionScanOut, status_code=status.HTTP_201_CREATED)
async def scan(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
) -> PrescriptionScan:
    if file.content_type not in ALLOWED_TYPES:
        raise AppError("Unsupported file type", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
    file_bytes = await file.read()
    if len(file_bytes) > 8 * 1024 * 1024:
        raise AppError("File is larger than 8MB", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
    medicines, confidence, raw_text = await extract_prescription(file_bytes, file.filename or "prescription", file.content_type or "")
    scan_record = PrescriptionScan(
        user_id=current_user.id,
        filename=file.filename or "prescription",
        content_type=file.content_type or "application/octet-stream",
        status=ScanStatus.COMPLETED.value,
        extracted_medicines=medicines,
        confidence=confidence,
        raw_text=raw_text,
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)
    return scan_record


@router.get("/scans", response_model=list[PrescriptionScanOut])
def scans(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> list[PrescriptionScan]:
    return list(
        db.scalars(
            select(PrescriptionScan)
            .where(PrescriptionScan.user_id == current_user.id)
            .order_by(PrescriptionScan.created_at.desc())
        ).all()
    )
