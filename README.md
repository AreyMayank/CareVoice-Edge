<div align="center">

# 🎙️ CareVoice Edge
### *Privacy-First, Offline Edge AI Voice Assistant & Caretaker Platform*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0%2B-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4%2B-38BDF8.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Hardware](https://img.shields.io/badge/Hardware-Raspberry_Pi_5_/_Desktop-C51A4A.svg?style=for-the-badge&logo=raspberrypi&logoColor=white)](https://www.raspberrypi.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

[Project Overview](#-1-project-overview) •
[Technology Stack](#-2-technology-stack) •
[System Architecture & Diagrams](#-3-system-architecture--diagrams) •
[Directory Structure](#-4-directory-structure) •
[API Reference](#-5-rest-api-reference) •
[Step-by-Step Installation & Setup](#-6-step-by-step-installation--setup-guide)

</div>

---

# 📖 1. Project Overview

**CareVoice Edge** is an autonomous, privacy-first Edge AI Voice Assistant and Caretaker Platform engineered specifically for elderly care and remote patient monitoring.

Unlike cloud-dependent voice assistants that stream voice data to third-party servers, CareVoice Edge processes **all voice listening, speech recognition (ASR), intent parsing, and text-to-speech (TTS) synthesis 100% locally on-device**. This design guarantees **low latency (<300ms)** and **100% patient data privacy**, functioning reliably even during internet outages.

### 🌟 Key Features
- 🔒 **100% Local On-Device AI**: Local speech-to-text (Vosk ASR) and text-to-speech synthesis (`pyttsx3`/Piper).
- ⏰ **Proactive Audio Reminders**: Scheduled spoken reminders for medication, blood pressure checks, and care routines.
- 🎙️ **Natural Voice Compliance**: Continuous microphone listening engine that recognizes verbal confirmations (*"I took it"*, *"Done"*).
- 🚨 **Real-Time Emergency SOS**: Instant detection of distress phrases (*"Help"*, *"Emergency"*, *"I fell down"*). Triggers an outbound multi-channel alert mesh (Twilio phone call, Telegram bot, ntfy push notification, email).
- 📊 **Caretaker Web Dashboard**: Glassmorphic React dashboard featuring task compliance analytics (Recharts), live voice audio simulation, and patient profile management.

---

# 💻 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Edge AI Engine** | Vosk ASR, `pyttsx3`, Piper TTS, OpenWakeWord, `sounddevice`, NumPy |
| **Backend Core** | Python 3.10+, FastAPI 0.110+, Uvicorn, APScheduler, Loguru |
| **Database & Security** | SQLite / PostgreSQL, SQLAlchemy ORM v2, Alembic, JWT (OAuth2), `bcrypt` |
| **Alert Dispatchers** | Twilio Voice API, Telegram Bot API, ntfy Push, SMTP Email |
| **Frontend UI** | React 18, TypeScript 5, Vite, Tailwind CSS v3, Recharts, Lucide Icons |
| **Testing** | Pytest, HTTPX Async Client, SQLite In-Memory Isolation |

---

# 🏗️ 3. System Architecture & Diagrams

### 3.1 End-to-End System Architecture

```mermaid
graph TD
    subgraph Hardware ["🎙️ Edge AI Hardware Layer (Raspberry Pi 5 / Desktop PC)"]
        MIC["Audio Capture (USB Microphone)"]
        SPK["Audio Output (Speaker)"]
        VOSK["Offline Vosk STT Engine"]
        TTS["Offline pyttsx3 / Piper TTS"]
        PARSE["Rule-Based Intent & Phrase Parser"]
    end

    subgraph Backend ["⚡ FastAPI Core Services (Python 3.10+)"]
        API["REST API Router (FastAPI v1)"]
        SCHED["APScheduler Background Service"]
        ALERT_ENG["Emergency Alert Engine"]
        LIVE_STATE["Live Device Telemetry Manager"]
        DB[(SQLite / PostgreSQL Engine)]
    end

    subgraph Dashboard ["🖥️ Caretaker Web Application (React 18 + TS + Vite)"]
        UI["Glassmorphic Caretaker UI"]
        ANALYTICS["Recharts Task Compliance Engine"]
        SIMULATOR["Interactive Voice Simulator"]
        LIVE_MONITOR["Live Telemetry & Emergency Status"]
    end

    subgraph Channels ["🚨 Emergency Dispatch Network"]
        TWILIO["Twilio Automated Phone Calls"]
        TELEGRAM["Telegram Bot Webhooks"]
        NTFY["ntfy Mobile Push Alerts"]
        EMAIL["SMTP Emergency Email Dispatch"]
    end

    %% Audio Hardware Flow
    MIC --> VOSK --> PARSE
    SCHED -->|Scheduled Routine Trigger| TTS --> SPK

    %% Core Logic Routing
    PARSE -->|Task Completed / Snoozed| API
    PARSE -->|Emergency SOS Phrase Detected| ALERT_ENG
    API <--> DB
    LIVE_STATE <--> API

    %% Caretaker UI Flow
    UI <-->|JWT Authenticated REST| API
    ANALYTICS <--> API
    SIMULATOR <--> API
    LIVE_MONITOR <--> LIVE_STATE

    %% Emergency Alerts Execution
    ALERT_ENG --> TWILIO
    ALERT_ENG --> TELEGRAM
    ALERT_ENG --> NTFY
    ALERT_ENG --> EMAIL
```

---

### 3.2 Patient Voice Verification & SOS Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Scheduler as APScheduler Engine
    participant TTS as Offline TTS (Speaker)
    participant Patient as Patient (Spoken Audio)
    participant MicEngine as Mic Listener & Vosk STT
    participant CoreAPI as FastAPI Core API
    participant CaretakerUI as Caretaker Dashboard
    participant AlertNet as Multi-Channel Alert Net

    Scheduler->>TTS: Trigger Scheduled Task ("Time for Blood Pressure Medicine")
    TTS->>Patient: Play Spoken Audio Prompt via Speaker

    Note over Patient,MicEngine: Voice Response Window Active

    alt Case A: Verbal Task Confirmation
        Patient->>MicEngine: Speaks "I took my medicine"
        MicEngine->>CoreAPI: Match Intent -> TASK_COMPLETED
        CoreAPI->>CaretakerUI: Update Live Dashboard & Compliance Analytics
    else Case B: Emergency SOS Keyword Detected
        Patient->>MicEngine: Speaks "Help! I fell down!"
        MicEngine->>CoreAPI: Match Intent -> EMERGENCY_SOS
        CoreAPI->>AlertNet: Dispatch Twilio Call + Telegram + Push Alerts
        AlertNet-->>CaretakerUI: Trigger Red Emergency Alert Banner
    end
```

---

### 3.3 Database ERD Schema

```mermaid
erDiagram
    CARETAKER ||--o{ PATIENT : manages
    PATIENT ||--o{ REMINDER : scheduled_for
    REMINDER ||--o{ TASK_LOG : generates
    PATIENT ||--o{ EMERGENCY_ALERT : triggers

    CARETAKER {
        int id PK
        string email UK
        string hashed_password
        string full_name
        datetime created_at
    }

    PATIENT {
        int id PK
        int caretaker_id FK
        string full_name
        int age
        string emergency_contact_phone
        text medical_notes
    }

    REMINDER {
        int id PK
        int patient_id FK
        string title
        string audio_prompt_text
        string cron_schedule
        boolean is_active
    }

    TASK_LOG {
        int id PK
        int reminder_id FK
        string status "COMPLETED | MISSED | SNOOZED"
        datetime timestamp
        string voice_transcription
    }

    EMERGENCY_ALERT {
        int id PK
        int patient_id FK
        string trigger_source "VOICE_SOS | MANUAL_BUTTON"
        string alert_status "DISPATCHED | ACKNOWLEDGED"
        datetime created_at
    }
```

---

# 📁 4. Directory Structure

```
Carevoice-edge/
├── backend/                      # FastAPI Backend Microservice
│   ├── app/
│   │   ├── api/v1/              # REST Routers (Auth, Patient, Reminders, Emergency, Analytics)
│   │   ├── core/                # JWT Security, Config, Database Engine
│   │   ├── models/              # SQLAlchemy ORM Models
│   │   ├── schemas/             # Pydantic v2 Schemas
│   │   └── services/            # Business Logic Layer
│   ├── calling/                 # Twilio Voice Call Dispatcher
│   ├── notifications/           # Telegram, ntfy, SMTP Multi-Channel Alert Engine
│   ├── scheduler/               # APScheduler Background Manager
│   ├── voice_engine/            # Vosk STT, pyttsx3 TTS, Intent Parser, Mic Listener
│   └── tests/                   # Pytest Test Suite
├── frontend/                     # React Caretaker Dashboard
│   └── src/
│       ├── api/                 # Typed Axios Client with JWT interceptors
│       ├── components/          # Glassmorphic UI Components & Voice Simulator
│       ├── context/             # AuthContext Provider
│       └── pages/               # Dashboard, Reminders, PatientProfile, Settings
└── scripts/                      # One-Click Startup Scripts
```

---

# 📡 5. REST API Reference

| Category | Method | Endpoint | Auth | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | None | Authenticate caretaker & return JWT token |
| **Patient** | `GET` | `/api/v1/patient/profile` | Bearer JWT | Retrieve patient details & emergency contacts |
| **Patient** | `PUT` | `/api/v1/patient/profile` | Bearer JWT | Update patient medical notes & details |
| **Reminders** | `GET` | `/api/v1/reminders/` | Bearer JWT | List all scheduled voice reminders |
| **Reminders** | `POST` | `/api/v1/reminders/` | Bearer JWT | Create a new voice reminder schedule |
| **Emergency** | `POST` | `/api/v1/emergency/trigger` | Bearer JWT | Manually trigger emergency alert mesh |
| **Analytics** | `GET` | `/api/v1/analytics/compliance` | Bearer JWT | Calculate compliance percentages & charts |
| **Live Status**| `GET` | `/api/v1/live-status` | Bearer JWT | Check mic listener state & live prompt status |
| **Health** | `GET` | `/health` | None | Verify API & database operational status |

---

# 🚀 6. Step-by-Step Installation & Setup Guide

Follow these step-by-step instructions to clone, configure, install dependencies, and run **CareVoice Edge** on any machine (PC / Mac / Linux / Raspberry Pi).

---

### 📋 Prerequisites

Ensure your system has the following installed:
- **Git**: Installed on your system ([Download Git](https://git-scm.com/))
- **Python**: Version `3.10` or `3.11` ([Download Python](https://www.python.org/downloads/))
- **Node.js**: Version `v18.0.0` or higher (`npm v9+`) ([Download Node.js](https://nodejs.org/))

---

### 🔹 Step 1: Clone the Repository

Open your terminal or command line interface and clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/Carevoice-edge.git
cd Carevoice-edge
```

---

### 🔹 Step 2: Set Up & Install Backend Dependencies

1. Navigate into the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create your `.env` configuration file from `.env.example`:
   - **Windows**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Linux / macOS**:
     ```bash
     cp .env.example .env
     ```

---

### 🔹 Step 3: Install Frontend Dependencies

1. Open a **new terminal window**, navigate to the repository root, and enter the `frontend` folder:
   ```bash
   cd Carevoice-edge/frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

---

### 🔹 Step 4: Run the Application

You can start the backend and frontend using either **Option A** (One-Click Script) or **Option B** (Manual Terminals).

#### Option A: One-Click Script (Windows)
From the project root folder:
```powershell
.\scripts\start_all.bat
```

#### Option B: Manual Terminal Execution

- **Terminal 1 (Backend Server)**:
  ```powershell
  cd backend
  .\venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --reload --port 8000
  ```

- **Terminal 2 (Frontend Caretaker Dashboard)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

### 🔹 Step 5: Open Browser & Log In

1. **Caretaker Web Dashboard**: Open [http://localhost:5173](http://localhost:5173)
2. **Default Credentials**:
   - **Email**: `caretaker@carevoice.local`
   - **Password**: `carevoice123`
3. **Interactive API Documentation (Swagger)**: Open [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🔹 Step 6: Verify with Pytest (Optional)

To execute backend automated unit & integration tests:

```bash
cd backend
python -m pytest -v
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
