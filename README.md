# HealthAI Symptom Checker

```text
██╗  ██╗███████╗ █████╗ ██╗  ████████╗██╗  ██╗ █████╗ ██╗
██║  ██║██╔════╝██╔══██╗██║  ╚══██╔══╝██║  ██║██╔══██╗██║
███████║█████╗  ███████║██║     ██║   ███████║███████║██║
██╔══██║██╔══╝  ██╔══██║██║     ██║   ██╔══██║██╔══██║██║
██║  ██║███████╗██║  ██║███████╗██║   ██║  ██║██║  ██║██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
```

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Random Forest](https://img.shields.io/badge/ML-Random%20Forest-7c3aed)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

HealthAI is a production-shaped AI healthcare symptom checker platform with a BioNeon Dark interface, FastAPI backend, PostgreSQL persistence, JWT auth, WebSocket notifications, OCR scan saving, PDF reports, and a Scikit-Learn Random Forest symptom-disease model.

> Medical disclaimer: this project is informational AI triage software and is not a substitute for emergency care or licensed clinical diagnosis.

## Features

- 🧠 AI symptom prediction with `predict_proba()` confidence scoring
- 🔍 Explainable AI using Random Forest feature importance
- 🧬 Persistent React Three Fiber background and immersive 3D scenes
- 🔐 JWT auth, refresh tokens, protected routes, and role-based admin access
- 📊 User dashboard with Recharts analytics and 3D health globe
- 🧾 Persisted health reports with PDF download and email queue endpoint
- 🚨 High-risk emergency overlay plus WebSocket notifications
- 💬 Floating HealthAI assistant with saved chat history
- 💊 Prescription OCR scanner workflow with saved extraction records
- 🛠️ Admin dashboard with users table, suspension action, and activity feed
- 🐳 Docker Compose deployment for frontend, backend, and PostgreSQL

## Tech Stack

Frontend:

- Next.js 15 App Router, TypeScript, React, Tailwind CSS
- ShadCN-style primitives, Framer Motion, React Hook Form, Zod
- Zustand, TanStack React Query, Recharts, Lucide Icons
- Three.js, React Three Fiber, Drei, React Spring Three, Leva-ready dependency, postprocessing

Backend:

- FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic
- JWT auth, refresh token hashing, global error handlers
- WebSockets for real-time notifications and admin activity
- ReportLab PDF generation

Machine Learning:

- Pandas, NumPy, Scikit-Learn `RandomForestClassifier`
- Label encoding, feature importance, confidence via `predict_proba()`
- Bundled Columbia-style symptom-disease CSV seed dataset

## Architecture

```text
Browser
  │
  ├── Next.js 15 App Router
  │     ├── BioNeon design system
  │     ├── R3F global 3D background
  │     ├── Zustand auth/assessment/notification stores
  │     └── React Query API cache
  │
  ├── WebSocket notifications
  │
  ▼
FastAPI API
  ├── Auth / Symptoms / Predictions / Reports
  ├── Dashboard / OCR / Chatbot / Admin
  ├── Random Forest ML service
  ├── PDF report service
  └── Global exception middleware
  │
  ▼
PostgreSQL
  ├── users, medical_history, symptoms
  ├── follow_up_questions, predictions, reports
  ├── doctors, notifications, chat_history
  └── prescription_scans
```

Detailed architecture lives in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Installation

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Update secrets in `.env`:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-second-long-random-secret
```

3. Run the full stack:

```bash
docker compose up --build
```

4. Open the apps:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

The backend seeds symptoms, follow-up questions, doctors, and an admin user on startup.

Default admin:

```text
Email: admin@healthai.com
Password: AdminPass123!
```

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Database migrations:

```bash
cd backend
alembic upgrade head
```

## API Summary

Base path: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `GET /auth/me`
- `GET /symptoms`
- `GET /symptoms/questions`
- `GET /medical-history`
- `PUT /medical-history`
- `POST /predictions/analyze`
- `GET /predictions`
- `POST /reports`
- `GET /reports/{id}`
- `GET /reports/{id}/download`
- `POST /reports/{id}/email`
- `GET /dashboard/overview`
- `GET /dashboard/charts`
- `GET /dashboard/history`
- `POST /ocr/scan`
- `POST /chatbot/message`
- `GET /notifications`
- `PATCH /notifications/read-all`
- `GET /admin/overview`
- `GET /admin/users`
- `PATCH /admin/users/{id}/suspend`
- `WS /ws/notifications/{user_id}`
- `WS /ws/admin/activity`

## Screenshots

Add screenshots after running the app:

- `docs/screenshots/landing.png`
- `docs/screenshots/assessment.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/admin.png`

## Deployment

The included Docker Compose file runs:

- `frontend` on port `3000`
- `backend` on port `8000`
- `postgres` on port `5432`

For production:

1. Replace all JWT and database secrets.
2. Put services behind HTTPS.
3. Restrict CORS origins in `backend/app/core/config.py`.
4. Run Alembic migrations explicitly.
5. Configure SMTP, OCR provider, and OAuth provider credentials.
6. Persist `backend/app/ml/artifacts` or bake the trained model into an image.

## Contributing

1. Create a feature branch.
2. Keep changes scoped and typed.
3. Add or update tests for backend endpoints and frontend workflows.
4. Run backend lint/type checks and frontend `npm run typecheck`.
5. Open a pull request with screenshots for UI changes.
