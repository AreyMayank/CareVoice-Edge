from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import SessionLocal
from app.services.reminder_service import ReminderService
from app.services.voice_service import VoiceService
from app.core.logging import log

class ReminderSchedulerManager:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                self.check_and_trigger_reminders,
                'interval',
                seconds=30,
                id='carevoice_reminder_check',
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            log.info("[Scheduler] Reminder Background Scheduler started (checks every 30 seconds).")

    def stop(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            log.info("Reminder Background Scheduler stopped.")

    @staticmethod
    def check_and_trigger_reminders():
        db = SessionLocal()
        try:
            now_str = datetime.now().strftime("%H:%M")
            reminders = ReminderService.get_all_reminders(db)
            for reminder in reminders:
                if reminder.is_active and reminder.scheduled_time == now_str:
                    log.info(f"[Scheduler] Triggered Reminder #{reminder.id}: {reminder.title}")
                    VoiceService.announce_reminder(db, reminder.id)
        except Exception as e:
            log.error(f"Scheduler error during reminder check: {e}")
        finally:
            db.close()

scheduler_manager = ReminderSchedulerManager()
