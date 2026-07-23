from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
from app.core.logging import log

class PatientService:
    @staticmethod
    def get_patient(db: Session, patient_id: int) -> Patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
        return patient

    @staticmethod
    def get_all_patients(db: Session, caretaker_id: Optional[int] = None) -> List[Patient]:
        query = db.query(Patient)
        if caretaker_id:
            query = query.filter(Patient.caretaker_id == caretaker_id)
        return query.all()

    @staticmethod
    def create_patient(db: Session, patient_in: PatientCreate, caretaker_id: Optional[int] = None) -> Patient:
        patient = Patient(
            full_name=patient_in.full_name,
            age=patient_in.age,
            room_number=patient_in.room_number,
            medical_conditions=patient_in.medical_conditions,
            emergency_contact=patient_in.emergency_contact,
            notes=patient_in.notes,
            caretaker_id=caretaker_id
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
        log.info(f"Created patient profile: {patient.full_name} (ID: {patient.id})")
        return patient

    @staticmethod
    def update_patient(db: Session, patient_id: int, patient_in: PatientUpdate) -> Patient:
        patient = PatientService.get_patient(db, patient_id)
        update_data = patient_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)
        db.commit()
        db.refresh(patient)
        log.info(f"Updated patient profile: {patient.full_name}")
        return patient
