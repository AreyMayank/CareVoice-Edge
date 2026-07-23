def get_auth_token(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "caretaker@test.com",
            "full_name": "Test Nurse",
            "password": "password123"
        }
    )
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "caretaker@test.com", "password": "password123"}
    )
    return login_res.json()["access_token"]

def test_reminder_crud_and_completion(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Patient
    patient_res = client.post(
        "/api/v1/patients",
        json={
            "full_name": "Arthur Dent",
            "age": 82,
            "room_number": "201",
            "medical_conditions": "Hypertension"
        },
        headers=headers
    )
    assert patient_res.status_code == 200
    patient_id = patient_res.json()["id"]

    # 2. Create Reminder
    reminder_res = client.post(
        "/api/v1/reminders",
        json={
            "patient_id": patient_id,
            "title": "Heart Medication",
            "category": "medicine",
            "scheduled_time": "14:00",
            "repeat_days": "daily",
            "audio_prompt": "Please take 1 pill of Aspirin",
            "max_retries": 3
        },
        headers=headers
    )
    assert reminder_res.status_code == 200
    reminder_id = reminder_res.json()["id"]

    # 3. Voice Confirm Task
    confirm_res = client.post(
        "/api/v1/reminders/confirm-voice",
        json={
            "reminder_id": reminder_id,
            "patient_speech": "I have taken my aspirin pill"
        }
    )
    assert confirm_res.status_code == 200
    confirm_data = confirm_res.json()
    assert confirm_data["status"] == "task_completed"
    assert confirm_data["intent"] == "CONFIRMATION"

    # 4. Check Analytics
    analytics_res = client.get("/api/v1/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_completed_tasks"] >= 1
