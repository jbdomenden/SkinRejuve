# SkinRejuve

This project serves the plain HTML/CSS/JavaScript frontend from the Ktor application and uses the Kotlin backend endpoints under the same origin.

## New system layout

- `src/main/kotlin/`: Ktor application, auth, database, and API routes
- `src/main/resources/frontend/`: static frontend assets served by Ktor
- `src/main/resources/backend/`: legacy prototype assets retained in the repository for reference

## Run application

```bash
./gradlew run
```

Application starts at `http://localhost:8080`.

Frontend pages:
- `http://localhost:8080/frontend/login.html`
- `http://localhost:8080/frontend/register.html`
- `http://localhost:8080/frontend/dashboard.html`
- `http://localhost:8080/frontend/admin.html`

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
- Frontend API calls are made against the live Ktor backend using the same origin by default.
- The `src/main/resources/backend/` directory is legacy prototype material and is not the production runtime path.
