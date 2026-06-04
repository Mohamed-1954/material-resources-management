# Deployment

## Local development

```bash
bun install
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d postgres
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

## Full Docker stack

```bash
bun run docker:up
```

Exposes:
- `http://localhost:5173` — React SPA (served by nginx)
- `http://localhost:3001` — Hono API
- `localhost:5432` — PostgreSQL

## Environment variables

See `.env.example` for the canonical list. Mandatory in production:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | 32+ char secret used to sign sessions |
| `BETTER_AUTH_URL` | Public URL of the API |
| `TRUSTED_ORIGINS` | Comma-separated list of allowed web origins (CORS + cookies) |
| `GITHUB_CLIENT_ID/SECRET` | Optional — enables GitHub OAuth |
| `GOOGLE_CLIENT_ID/SECRET` | Optional — enables Google OAuth |

## Production hardening checklist

- [ ] Set `NODE_ENV=production` to enable `secure` cookies.
- [ ] Run behind a TLS-terminating proxy (or run nginx with TLS).
- [ ] Rotate `BETTER_AUTH_SECRET` and never commit it.
- [ ] Restrict `TRUSTED_ORIGINS` to the real web domain.
- [ ] Pin Postgres backup schedule.
- [ ] Forward `audit_logs` to a long-term store (out of scope for the prototype).
