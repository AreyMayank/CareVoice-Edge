from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.patient import router as patient_router
from app.api.v1.reminders import router as reminders_router
from app.api.v1.emergency import router as emergency_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.live_status import router as live_status_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(patient_router)
api_router.include_router(reminders_router)
api_router.include_router(emergency_router)
api_router.include_router(analytics_router)
api_router.include_router(live_status_router)
