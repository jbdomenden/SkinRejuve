# SkinRejuve Clinic Portal

Production-oriented full-stack architecture for **Skin Rejuve Clinic Portal**.

## Phased implementation plan

1. **Phase 1: Inspect + Plan**
   - Confirm architecture and stack constraints.
   - Define module boundaries and security model.
2. **Phase 2: Project structure + configuration**
   - Ktor module structure under `com.clinicportal`.
   - Config loaders for app/JWT/DB/SMTP via environment variables.
3. **Phase 3: Backend foundation**
   - PostgreSQL schema and Exposed table mappings.
   - Auth (register/login), email verification, forgot/reset password.
4. **Phase 4: Core modules**
   - Patient profile/intake, service catalog, appointment booking/history/status.
5. **Phase 5: Frontend**
   - React + Vite app with Router, Query, RHF, Zod, Tailwind, Axios.
6. **Phase 6: Advanced modules**
   - Staff/treatment records, notifications, analytics.
7. **Phase 7: Validation**
   - Endpoint/auth/status-flow/schema/SMTP verification.

## Environment

Critical runtime secrets **must** be provided by environment variables:

- `JWT_SECRET`
- `DB_JDBC_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`

## Backend startup

```bash
./gradlew run
```

## Notes

Legacy starter files from the initial scaffold still exist under `src/main/kotlin/zeroday` package and are not used by the `com.clinicportal` module entrypoint.
