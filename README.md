# SkinRejuve Clinic Portal

Production-oriented full-stack architecture for **Skin Rejuve Clinic Portal**.

## Namespace mapping

To keep Kotlin package naming idiomatic while preserving your requested namespace semantics:

- requested semantic namespace: `zeroday.SkinRejuve`
- runtime/code package namespace: `zeroday.skinrejuve`
- entrypoint: `zeroday.skinrejuve.ApplicationKt`

## Phased implementation status

1. ✅ **Phase 3: Backend foundation**
   - PostgreSQL schema + Exposed tables
   - Auth register/login
   - Email verification and forgot/reset password flows
2. ✅ **Phase 4: Core modules**
   - Patient profile/intake
   - Services catalog
   - Appointment booking/history/status
3. ✅ **Phase 5: Frontend scaffold**
   - React + Vite + Router + Query + RHF + Zod + Tailwind + Axios
4. ✅ **Phase 6: Advanced module scaffold**
   - Staff, treatment records, notifications, analytics routes/services
5. ⚠️ **Phase 7 validation in this environment**
   - automated build/test is blocked by Gradle wrapper download proxy restrictions

## Environment

Critical runtime secrets should be provided via environment variables:

- `JWT_SECRET`
- `DB_JDBC_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`

## Startup

Backend:

```bash
./gradlew run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Phase 7 validation hardening

Added backend integration tests for:
- auth/token lifecycle behavior (verification/reset token consumption and login verification requirements)
- appointment status and booking rule enforcement
- route-level role access checks (admin/analytics)

### Local validation stack (PostgreSQL + MailHog)

```bash
docker compose up -d
```

Services:
- PostgreSQL: `localhost:5432`
- MailHog SMTP: `localhost:1025`
- MailHog UI: `http://localhost:8025`

Run backend tests:

```bash
./gradlew test
```
