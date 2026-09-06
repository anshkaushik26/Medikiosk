# MEDIKIOSK ? Accessible Digital Healthcare Platform for India

MediKiosk is an accessible, human-centered digital healthcare web platform designed for India, specifically empowering senior citizens, rural populations, and first-time digital users while giving doctors a structured clinical view before consultations.

**"Make healthcare information simple before the consultation begins."**

---

## Key Principles & Architecture

1. **Unified Application**: One frontend, one backend, one authentication system, role-based routing (`/`, `/auth`, `/onboarding/*`, `/patient/*`, `/doctor/*`, `/settings`).
2. **National Healthcare Identity Only**: No platform-specific or MediKiosk ID exists anywhere. Identity entry points are **ABHA ID**, **Aadhaar Card**, or **Mobile Number**.
3. **Pluggable Identity Adapters**: Abstracted provider architecture (`IdentityProvider` -> `ABHAProvider`, `AadhaarProvider`, `MobileProvider`).
4. **Resilient Onboarding**: State and draft persistence in browser local storage ensures refreshing at any step never loses user input or causes redirect loops.
5. **Calm & Accessible UI**: Senior-friendly large touch targets, high contrast, clean healthcare teal/emerald visual language, speech synthesis audio helper, and full bilingual capability (**English** & **??????**).
6. **Prioritized Patient Dashboard**: Strictly preserves the 4 core actions without clutter:
   - ?? **Talk to MediKiosk**
   - ?? **My Reports**
   - ?? **My Medicines**
   - ?? **My Health**
7. **Doctor Clinical Portal**: Direct patient file lookup by ABHA or Mobile Number with verified identity badge and clinical snapshot.

---

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.x (async), aiosqlite (local dev zero-config fallback) / asyncpg (PostgreSQL application database), Pydantic v2
- **Testing**: Pytest, pytest-asyncio, HTTPX

---

## Quick Start Guide

### 1. Start FastAPI Backend

```bash
cd backend
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies if needed:
pip install -r requirements.txt

# Run backend on port 8000:
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Start Next.js Frontend

```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Demo Credentials & Test Data

The application pre-seeds synthetic demo accounts for instant testing:

- **Mock Verification Code (OTP)**: `123456`
- **Demo Patient**:
  - Name: **Ramesh Kumar**
  - Mobile: `+91 98765 43210` (or `9876543210`)
  - ABHA ID: `91-1234-5678-9012`
- **Demo Doctor**:
  - Name: **Dr. Rajesh Sharma**
  - Mobile: `+91 98765 00001` (or `9876500001`)
  - Specialization: General Medicine & Family Health
  - Hospital: City Health Clinic

---

## Running Backend Automated Tests

```bash
# From workspace root:
$env:PYTHONPATH="."
backend/.venv/Scripts/python -m pytest backend/tests/test_api.py -v
```
All 4 test suites cover health checks, mock OTP challenges & logins, doctor patient searches, preferences updates, and demo resets.
