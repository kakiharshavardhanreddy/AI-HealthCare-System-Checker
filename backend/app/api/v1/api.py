from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, chatbot, dashboard, doctors, medical_history, notifications, ocr, predictions, reports, symptoms

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(symptoms.router)
api_router.include_router(medical_history.router)
api_router.include_router(predictions.router)
api_router.include_router(reports.router)
api_router.include_router(dashboard.router)
api_router.include_router(ocr.router)
api_router.include_router(chatbot.router)
api_router.include_router(doctors.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
