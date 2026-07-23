from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import PatientService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PatientService.get_all_patients(db, caretaker_id=current_user.id)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PatientService.get_patient(db, patient_id)

@router.post("", response_model=PatientResponse)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PatientService.create_patient(db, patient_in, caretaker_id=current_user.id)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient_in: PatientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PatientService.update_patient(db, patient_id, patient_in)
