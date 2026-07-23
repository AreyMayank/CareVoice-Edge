from pydantic import BaseModel
from typing import List, Dict, Any

class CategoryStats(BaseModel):
    category: str
    total: int
    completed: int
    missed: int

class AnalyticsSummary(BaseModel):
    total_reminders: int
    completion_rate_percentage: float
    total_completed_tasks: int
    total_missed_tasks: int
    total_emergency_events: int
    active_emergencies: int
    average_response_time_seconds: float
    category_breakdown: List[CategoryStats]

class LiveStatusResponse(BaseModel):
    current_reminder: Dict[str, Any]
    last_confirmation: Dict[str, Any]
    next_reminder: Dict[str, Any]
    device_status: Dict[str, Any]
