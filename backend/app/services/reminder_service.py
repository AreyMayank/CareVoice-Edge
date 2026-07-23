from typing import List, Optional
from datetime import datetime, timezone
import os
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.reminder import Reminder
from app.models.task_completion import TaskCompletion
from app.models.emergency_event import EmergencyEvent
from app.schemas.reminder import ReminderCreate, ReminderUpdate
from app.core.logging import log

def is_raspberry_pi() -> bool:
    try:
        if os.path.exists('/sys/firmware/devicetree/base/model'):
            with open('/sys/firmware/devicetree/base/model', 'r') as f:
                return 'raspberry pi' in f.read().lower()
    except Exception:
        pass
    return False

class ReminderService:
    @staticmethod
    def get_reminder(db: Session, reminder_id: int) -> Reminder:
        reminder = db.query(Reminder).options(joinedload(Reminder.completions)).filter(Reminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
        return reminder

    @staticmethod
    def get_all_reminders(db: Session, patient_id: Optional[int] = None) -> List[Reminder]:
        query = db.query(Reminder).options(joinedload(Reminder.completions))
        if patient_id:
            query = query.filter(Reminder.patient_id == patient_id)
        return query.order_by(Reminder.scheduled_time.asc()).all()

    @staticmethod
    def create_reminder(db: Session, reminder_in: ReminderCreate) -> Reminder:
        reminder = Reminder(
            patient_id=reminder_in.patient_id,
            title=reminder_in.title,
            category=reminder_in.category,
            scheduled_time=reminder_in.scheduled_time,
            repeat_days=reminder_in.repeat_days,
            is_active=reminder_in.is_active,
            audio_prompt=reminder_in.audio_prompt,
            max_retries=reminder_in.max_retries,
            retry_interval_minutes=reminder_in.retry_interval_minutes
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        log.info(f"Created reminder: {reminder.title} at {reminder.scheduled_time}")
        return reminder

    @staticmethod
    def update_reminder(db: Session, reminder_id: int, reminder_in: ReminderUpdate) -> Reminder:
        reminder = ReminderService.get_reminder(db, reminder_id)
        update_data = reminder_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(reminder, field, value)
        db.commit()
        db.refresh(reminder)
        log.info(f"Updated reminder ID {reminder_id}")
        return reminder

    @staticmethod
    def delete_reminder(db: Session, reminder_id: int) -> bool:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
        db.delete(reminder)
        db.commit()
        log.info(f"Deleted reminder ID {reminder_id}")
        return True

    @staticmethod
    def record_completion(
        db: Session,
        reminder_id: int,
        status_name: str,
        speech_transcript: Optional[str] = None,
        response_time_seconds: Optional[float] = None,
        attempt_count: int = 1,
        notes: Optional[str] = None
    ) -> TaskCompletion:
        reminder = ReminderService.get_reminder(db, reminder_id)
        
        completion = TaskCompletion(
            reminder_id=reminder.id,
            status=status_name,
            completed_at=datetime.now(timezone.utc) if status_name == "completed" else None,
            patient_speech_transcript=speech_transcript,
            response_time_seconds=response_time_seconds,
            attempt_count=attempt_count,
            notes=notes
        )
        db.add(completion)
        db.commit()
        db.refresh(completion)
        log.info(f"Recorded completion for reminder ID {reminder_id}: status={status_name}")
        return completion

    @staticmethod
    def get_analytics(db: Session) -> dict:
        total_reminders = db.query(Reminder).count()
        completions = db.query(TaskCompletion).all()
        
        completed_count = sum(1 for c in completions if c.status == "completed")
        missed_count = sum(1 for c in completions if c.status == "missed")
        total_attempts = completed_count + missed_count
        
        completion_rate = (completed_count / total_attempts * 100.0) if total_attempts > 0 else 100.0
        
        emergencies = db.query(EmergencyEvent).all()
        active_emergencies = sum(1 for e in emergencies if e.status == "active")
        
        valid_times = [c.response_time_seconds for c in completions if c.response_time_seconds is not None]
        avg_response_time = (sum(valid_times) / len(valid_times)) if valid_times else 0.0

        # Category breakdown
        categories = ["medicine", "exercise", "hydration", "vitals", "general"]
        category_stats = []
        for cat in categories:
            cat_reminders = db.query(Reminder).filter(Reminder.category == cat).all()
            cat_reminder_ids = [r.id for r in cat_reminders]
            if not cat_reminder_ids:
                category_stats.append({
                    "category": cat,
                    "total": 0,
                    "completed": 0,
                    "missed": 0
                })
                continue
            
            cat_completions = [c for c in completions if c.reminder_id in cat_reminder_ids]
            cat_completed = sum(1 for c in cat_completions if c.status == "completed")
            cat_missed = sum(1 for c in cat_completions if c.status == "missed")
            category_stats.append({
                "category": cat,
                "total": len(cat_reminders),
                "completed": cat_completed,
                "missed": cat_missed
            })

        return {
            "total_reminders": total_reminders,
            "completion_rate_percentage": round(completion_rate, 1),
            "total_completed_tasks": completed_count,
            "total_missed_tasks": missed_count,
            "total_emergency_events": len(emergencies),
            "active_emergencies": active_emergencies,
            "average_response_time_seconds": round(avg_response_time, 1),
            "category_breakdown": category_stats
        }

    @staticmethod
    def get_live_status(db: Session) -> dict:
        reminders = db.query(Reminder).filter(Reminder.is_active == True).order_by(Reminder.scheduled_time.asc()).all()
        last_completion = db.query(TaskCompletion).order_by(TaskCompletion.created_at.desc()).first()
        
        now_str = datetime.now().strftime("%H:%M")
        next_rem = None
        current_rem = None
        
        for r in reminders:
            if r.scheduled_time >= now_str:
                next_rem = r
                break
        if not next_rem and reminders:
            next_rem = reminders[0]
            
        if reminders:
            current_rem = reminders[0]

        return {
            "current_reminder": {
                "id": current_rem.id if current_rem else None,
                "title": current_rem.title if current_rem else "No Active Reminders",
                "category": current_rem.category if current_rem else "N/A",
                "scheduled_time": current_rem.scheduled_time if current_rem else "--:--"
            },
            "last_confirmation": {
                "id": last_completion.id if last_completion else None,
                "status": last_completion.status if last_completion else "No confirmations recorded",
                "timestamp": last_completion.created_at.isoformat() if last_completion else None,
                "transcript": last_completion.patient_speech_transcript if last_completion else None
            },
            "next_reminder": {
                "id": next_rem.id if next_rem else None,
                "title": next_rem.title if next_rem else "None",
                "scheduled_time": next_rem.scheduled_time if next_rem else "--:--"
            },
            "device_status": {
                "offline_mode": True,
                "target": "Raspberry Pi 5 / Edge AI" if is_raspberry_pi() else "Simulated Local Desktop",
                "speech_engine": "Vosk + pyttsx3",
                "system_status": "Operational" if is_raspberry_pi() else "Simulated",
                "wakeword_active": True,
                "raspberry_connected": is_raspberry_pi()
            }
        }
