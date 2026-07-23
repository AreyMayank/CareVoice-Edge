from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsSummary
from app.services.reminder_service import ReminderService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReminderService.get_analytics(db)
