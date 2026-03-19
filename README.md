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

Development demo accounts:
- Patient: `patient@skinrejuve.local` / `Patient123!`
- Admin: `superadmin@skinrejuve.local` / `SuperAdmin123!`

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

## Deploy on Render

This repository includes both a Render Blueprint in `render.yaml` for Render's native Java runtime and a `Dockerfile` for container-based deployments. Keep both deployment paths aligned with the project's Java 21 requirement.

### Provisioned infrastructure

- Web service: `skinrejuve`
- PostgreSQL database: `skinrejuve-db`
- Health check: `GET /health`
- Generated secret: `JWT_SECRET`

### Build and start commands

```bash
./gradlew buildFatJar
java -jar build/libs/SkinRejuve-all.jar
```

### Required Render environment variables after first deploy

- `APP_URL` — set this to your Render app URL, such as `https://skinrejuve.onrender.com`
- `CORS_ALLOWED_ORIGINS` — set this to the frontend origin allowed to call the API

### Gmail SMTP configuration on Render

The Render blueprint is configured for Gmail SMTP by default:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_TLS=true`

Set the following secrets in Render to enable real email delivery:

- `SMTP_USER` — your Gmail address
- `SMTP_PASSWORD` — a Gmail App Password (do not use your normal account password)
- `SMTP_FROM` — usually the same Gmail address as `SMTP_USER`

### Optional production environment variables

Use these when seeding a production admin account:

- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`

### Database URL handling

The application now accepts Render-style `DATABASE_URL` values in `postgres://...` format and converts them to the JDBC URL required by PostgreSQL/Hikari at startup.
