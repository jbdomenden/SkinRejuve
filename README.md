# SkinRejuve (HTML/CSS/JS + Node.js rewrite)

This repository has been rewritten into a plain **HTML/CSS/JavaScript frontend** and a plain **Node.js backend** (no React, no Ktor runtime required for the new stack).

## New system layout

- `src/main/resources/backend/`
  - `server.js`: HTTP API server
  - `services/`: auth, patient, appointment logic
  - `lib/`: JSON storage + token utils
  - `data/db.json`: local dev datastore
  - `schema.sql`: PostgreSQL schema reference
- `src/main/resources/frontend/`
  - `index.html`: patient portal UI
  - `admin.html`: admin status update UI
  - `styles.css`, `app.js`, `admin.js`: vanilla frontend assets

## Run backend

```bash
node src/main/resources/backend/server.js
```

Backend starts at `http://localhost:8080`.

## Run frontend

```bash
cd src/main/resources/frontend
python3 -m http.server 5173
```

Frontend pages:
- `http://localhost:5173/index.html`
- `http://localhost:5173/admin.html`

## API overview

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/services`
- `GET /api/patient/profile` (auth)
- `POST /api/patient/profile` (auth)
- `POST /api/patient/intake` (auth)
- `POST /api/appointments` (auth)
- `GET /api/appointments/history` (auth)
- `PATCH /api/appointments/:id` (auth, STAFF/ADMIN)

## Notes

- Appointment rules implemented:
  - no past booking
  - no double-booking active slots
  - booking defaults to `PENDING`
  - `DENIED` requires `denialReason`
  - completed appointment cannot be cancelled
- Auth tokens are HMAC-signed JWT-like tokens for this rewrite.
- Existing Kotlin/Ktor code remains in the repo history, but the new runtime system is Node + vanilla frontend.
