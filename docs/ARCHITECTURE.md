# HealthAI Production Architecture

## Project Structure

```text
.
+-- backend/
|   +-- alembic/
|   |   +-- env.py
|   |   +-- versions/0001_initial_schema.py
|   +-- app/
|   |   +-- api/
|   |   |   +-- deps.py
|   |   |   +-- v1/
|   |   |       +-- api.py
|   |   |       +-- endpoints/
|   |   +-- core/
|   |   +-- db/
|   |   +-- ml/
|   |   |   +-- data/columbia_symptom_disease.csv
|   |   +-- services/
|   |   +-- main.py
|   |   +-- models.py
|   |   +-- schemas.py
|   +-- Dockerfile
|   +-- requirements.txt
+-- frontend/
|   +-- app/
|   |   +-- (auth)/
|   |   +-- admin/
|   |   +-- assessment/
|   |   +-- dashboard/
|   |   +-- history/
|   |   +-- scanner/
|   |   +-- reports/[id]/
|   +-- components/
|   |   +-- assessment/
|   |   +-- chatbot/
|   |   +-- dashboard/
|   |   +-- design/
|   |   +-- layout/
|   |   +-- notifications/
|   |   +-- three/
|   |   +-- ui/
|   +-- hooks/
|   +-- lib/
|   +-- stores/
|   +-- Dockerfile
|   +-- package.json
+-- docker-compose.yml
+-- .env.example
+-- README.md
```

## Database Schema

- `users`: identity, role, hashed password, OAuth provider marker, refresh-token hash, account flags.
- `medical_history`: one-to-one user medical context: allergies, chronic conditions, surgeries, family history, medications.
- `symptoms`: canonical symptom catalog with category, affected body area, emergency weight, and ML feature key.
- `follow_up_questions`: dynamic symptom-linked questions used during assessment.
- `predictions`: assessment input payload, Random Forest prediction, confidence, severity, risk score, feature-importance explanation, top diseases.
- `reports`: generated assessment report metadata and persisted report JSON.
- `doctors`: searchable recommended clinicians and specialties.
- `notifications`: WebSocket and persisted user/admin notifications.
- `chat_history`: user and AI assistant messages with session IDs.
- `prescription_scans`: OCR uploads, extracted medication JSON, confidence, status.

Relationships:

- `users 1 -> many predictions/reports/notifications/chat_history/prescription_scans`
- `users 1 -> 1 medical_history`
- `predictions 1 -> many reports`
- `symptoms 1 -> many follow_up_questions`

## API Architecture

Base path: `/api/v1`

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `GET /auth/me`
- Symptoms: `GET /symptoms`, `POST /symptoms` admin, `GET /symptoms/questions`
- Medical History: `GET /medical-history`, `PUT /medical-history`
- Predictions: `POST /predictions/analyze`, `GET /predictions`, `GET /predictions/{id}`
- Reports: `POST /reports`, `GET /reports/{id}`, `GET /reports/{id}/download`, `POST /reports/{id}/email`
- Dashboard: `GET /dashboard/overview`, `GET /dashboard/history`, `GET /dashboard/charts`
- OCR: `POST /ocr/scan`, `GET /ocr/scans`
- Chatbot: `POST /chatbot/message`, `GET /chatbot/history`
- Doctors: `GET /doctors`, `POST /doctors` admin
- Notifications: `GET /notifications`, `PATCH /notifications/read-all`
- Admin: `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/{id}/suspend`, `GET /admin/activity`
- WebSockets: `WS /ws/notifications/{user_id}`, `WS /ws/admin/activity`

All REST endpoints return typed JSON, appropriate HTTP status codes, and route through global exception middleware.

## ML Architecture

- Training data is stored in `backend/app/ml/data/columbia_symptom_disease.csv`.
- The ML service converts disease/symptom rows into a multi-hot symptom matrix.
- `LabelEncoder` maps disease names to numeric labels.
- `RandomForestClassifier` performs classification.
- `predict_proba()` generates confidence and top-three differential diagnoses.
- Feature importance is mapped back to symptom labels for explainability.
- The model lazily trains at API startup when an artifact does not exist, then caches in memory.

## Frontend Routes

- `/`: landing page with BioNeon hero, feature sections, capability visualization, testimonials, FAQ, footer.
- `/login`, `/register`, `/forgot-password`: authentication forms with validation, saving, loading, and auth store integration.
- `/assessment`: nine-step AI assessment flow; saves prediction/report data through backend APIs.
- `/dashboard`: protected user analytics, Recharts, health globe widget, notification bell.
- `/history`: protected timeline with filters and report actions.
- `/scanner`: protected prescription OCR workflow.
- `/reports/[id]`: protected report detail, download, email, share.
- `/admin`: role-protected admin dashboard with users, activity, and distribution globe.

## Frontend Component Structure

- `components/design`: app-specific BioNeon primitives (`Button3D`, `GlassCard`, `GlowInput`, `StatCard`, skeletons).
- `components/ui`: ShadCN-style low-level primitives.
- `components/three`: R3F scenes, optimized with memoized buffers, instancing, lazy loading, and mobile particle reduction.
- `components/assessment`: form steps, analysis screen, result cards, body visualization, report preview.
- `components/dashboard`: chart widgets and dashboard sections.
- `components/chatbot`: floating AI assistant widget.
- `components/notifications`: WebSocket toasts and notification dropdown.
- `components/layout`: sidebar, route guard, page transition shell.

## Zustand Stores

- `useAuthStore`: user, tokens, login/register/logout, refresh token, role checks.
- `useAssessmentStore`: multi-step form state, selected symptoms, follow-up answers, prediction, report payload.
- `useNotificationStore`: unread count, toasts, WebSocket pushes, mark-read actions.
- `useUiStore`: theme preference, sidebar state, custom cursor toggle, emergency overlay state.

## Deployment

Docker Compose runs:

- `postgres:16` on `5432`
- `backend` FastAPI on `8000`
- `frontend` Next.js on `3000`

Health checks protect service startup order, Alembic migrations are available through the backend image, and all environment variables are documented in `.env.example`.
