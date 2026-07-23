from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.logging import log
from app.api.v1.router import api_router
from app.models.user import User
from app.models.patient import Patient
from app.models.reminder import Reminder
from app.core.security import get_password_hash
from scheduler.manager import scheduler_manager
from voice_engine.mic_listener import mic_listener

def seed_initial_data():
    db = SessionLocal()
    try:
        # Create default caretakers for both .com and .local if none exist
        emails = ["caretaker@carevoice.com", "caretaker@carevoice.local"]
        first_user = None
        for email_addr in emails:
            existing = db.query(User).filter(User.email == email_addr).first()
            if not existing:
                u = User(
                    email=email_addr,
                    full_name="Primary Caretaker",
                    hashed_password=get_password_hash("carevoice123"),
                    role="caretaker"
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                if not first_user:
                    first_user = u
                log.info(f"Seeded default caretaker: {email_addr} / carevoice123")
            elif not first_user:
                first_user = existing

        if db.query(Patient).count() == 0 and first_user:
            # Create default patient
            default_patient = Patient(
                full_name="Eleanor Vance",
                age=78,
                room_number="104B",
                medical_conditions="Hypertension, Mild Arthritis, Type-2 Diabetes",
                emergency_contact="+1 (555) 019-2831",
                notes="Requires morning blood pressure check & hydration reminders.",
                caretaker_id=first_user.id
            )
            db.add(default_patient)
            db.commit()
            db.refresh(default_patient)
            log.info(f"Seeded default patient profile: Eleanor Vance (ID: {default_patient.id})")

            # Seed default sample reminders
            reminders = [
                Reminder(
                    patient_id=default_patient.id,
                    title="Take Blood Pressure Medicine",
                    category="medicine",
                    scheduled_time="09:00",
                    repeat_days="daily",
                    audio_prompt="Please take 1 tablet of Amlodipine with water.",
                    max_retries=3
                ),
                Reminder(
                    patient_id=default_patient.id,
                    title="Morning Hydration",
                    category="hydration",
                    scheduled_time="11:00",
                    repeat_days="daily",
                    audio_prompt="Please drink a full glass of fresh water.",
                    max_retries=2
                ),
                Reminder(
                    patient_id=default_patient.id,
                    title="Light Stretching Walk",
                    category="exercise",
                    scheduled_time="16:30",
                    repeat_days="weekdays",
                    audio_prompt="It's time for your 10-minute hallway walk exercise.",
                    max_retries=2
                ),
            ]
            db.add_all(reminders)
            db.commit()
            log.info("Seeded initial patient reminders.")

    except Exception as e:
        log.error(f"Error seeding initial database: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create DB tables
    log.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    
    # 2. Start background scheduler
    scheduler_manager.start()
    
    # 3. Start microphone listener thread
    mic_listener.start()
    
    yield
    
    # Shutdown microphone listener and scheduler
    mic_listener.stop()
    scheduler_manager.stop()
    log.info("CareVoice Edge Backend shut down cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "architecture": "Offline Edge AI / Raspberry Pi 5 Ready",
        "api_docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
