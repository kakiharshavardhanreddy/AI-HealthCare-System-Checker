from typing import Annotated

from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]) -> User:
    payload = decode_access_token(token)
    if payload.get("type") != "access":
        raise AppError("Invalid token type", status.HTTP_401_UNAUTHORIZED)
    user_id = payload.get("sub")
    if not user_id:
        raise AppError("Invalid token subject", status.HTTP_401_UNAUTHORIZED)
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise AppError("User is inactive or does not exist", status.HTTP_401_UNAUTHORIZED)
    return user


def get_current_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise AppError("Admin access required", status.HTTP_403_FORBIDDEN)
    return current_user
