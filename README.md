# Recepination Service

Production-oriented REST API for the Recepination recipe application. It uses Express 5, PostgreSQL, Prisma, JWT access tokens, rotating refresh tokens, Zod validation, Supabase Storage, and Nodemailer.

## Requirements

- Node.js 22+
- pnpm 10+
- PostgreSQL
- Supabase Storage bucket named `recepination-storage` when image uploads are enabled
- SMTP credentials unless development verification bypass is explicitly enabled

## Local setup

```bash
cp .env.example .env
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

The API listens on `http://localhost:8000` by default. Versioned endpoints live under `/api/v1`. Liveness and database readiness checks are available at `/health` and `/ready`.

For local-only development without SMTP, set `SKIP_EMAIL_VERIFICATION=true`. The service refuses this bypass in production.

## Commands

```bash
pnpm dev
pnpm start
pnpm test
pnpm lint
pnpm prisma:validate
pnpm check
```

## Authentication

Login returns a short-lived JWT access token and a rotating opaque refresh token. Send the access token as `Authorization: Bearer <token>`. Store refresh tokens securely and replace the old token every time `/api/v1/auth/refresh-token` succeeds.

User identity is always derived from the verified access token. Clients must not send a `userId` to perform actions on behalf of another user.

## API contract

The OpenAPI source is [docs/openapi.yaml](docs/openapi.yaml). Successful collection responses use:

```json
{
  "success": true,
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
}
```

Errors include a request ID that also appears in server logs.

## Production notes

- Run `prisma migrate deploy` before starting a new release.
- Use a long random `SECRET_KEY` and never expose the Supabase service-role key to the browser.
- Use a shared rate-limit store such as Redis when deploying multiple API instances; the included limiter is process-local.
- Forward `SIGTERM` during deployments so the HTTP server and Prisma connection close cleanly.
