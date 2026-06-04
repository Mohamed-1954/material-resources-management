# Faculty Material Resources Management System

Academic full-stack project: a modular monolith for managing the lifecycle of faculty hardware
resources — from teacher needs through tenders, supplier offers, inventory, assignments,
maintenance, and warranty decisions.

## Stack

- **Runtime / package manager**: Bun
- **Backend**: Hono + TypeScript, Better Auth (email/password, GitHub, Google), Drizzle ORM, PostgreSQL
- **Frontend**: React 19 + TypeScript, TanStack Router (file-based), TanStack Query, TanStack Form, Valibot, TailwindCSS, shadcn/ui, Base UI
- **Tests**: bun:test (API), Vitest + Testing Library (Web)
- **Architecture**: modular monolith — `apps`-style split across `material-resources-management-api`,
  `material-resources-management-client`, and `packages/shared`.

## Repository layout

```
.
├── material-resources-management-api/        # Hono API (modular monolith)
│   └── src/
│       ├── auth/              Better Auth config
│       ├── config/            env loader
│       ├── db/                Drizzle schema, client, migrate, seed
│       ├── middleware/        session, RBAC, error handler
│       ├── modules/
│       │   ├── auth/          supplier registration
│       │   ├── users/
│       │   ├── departments/
│       │   ├── needs/
│       │   ├── tenders/
│       │   ├── suppliers/
│       │   ├── offers/
│       │   ├── inventory/
│       │   ├── assignments/
│       │   ├── maintenance/
│       │   ├── notifications/
│       │   └── audit/
│       └── shared/            audit, errors, notify, validate
├── material-resources-management-client/     # React + Vite + TanStack
│   └── src/
│       ├── components/        layout, ui primitives
│       ├── features/dashboards/
│       ├── lib/               api-client, auth-client, query-client, permissions
│       └── routes/            file-based routes (TanStack Router)
├── packages/shared/           shared schemas, types, constants, RBAC matrix
├── infra/docker-compose.yml
├── docs/                      academic documentation
└── .github/workflows/ci.yml
```

## Quick start

```bash
# 1. Install
bun install

# 2. Copy env file
cp .env.example .env
# Edit BETTER_AUTH_SECRET, GITHUB/GOOGLE OAuth ids, etc.

# 3. Start PostgreSQL
docker compose -f infra/docker-compose.yml up -d postgres

# 4. Generate + apply migrations
bun run db:generate
bun run db:migrate

# 5. Seed demo data
bun run db:seed

# 6. Run dev servers (API on 3001, Web on 5173)
bun run dev
```

### Demo accounts (seed data)

All demo passwords: `changeme123`

| Role                   | Email                  |
| ---------------------- | ---------------------- |
| ADMIN                  | admin@faculty.local    |
| RESOURCE_MANAGER       | manager@faculty.local  |
| DEPARTMENT_HEAD (CS)   | cs.head@faculty.local  |
| TEACHER (CS)           | teacher@faculty.local  |
| MAINTENANCE_TECHNICIAN | tech@faculty.local     |
| SUPPLIER (Acme)        | supplier@faculty.local |

### Full Docker stack

```bash
bun run docker:up   # postgres + api + web
```

## Quality gates

```bash
bun install
bun run typecheck
bun run test
bun run build
```

## Documentation

The `docs/` folder contains the academic deliverables:

- `docs/requirements/` — functional requirements, actors, use cases
- `docs/bpmn/` — business process diagrams
- `docs/uml/` — class, package, use-case diagrams
- `docs/architecture/` — architecture and deployment docs
- `docs/project-management/` — release plan
- `docs/testing/test-strategy.md`
- `docs/api.md` — API surface

## Security model

- Better Auth handles credentials, sessions, OAuth (GitHub & Google).
- Privileged roles (`ADMIN`, `RESOURCE_MANAGER`, `DEPARTMENT_HEAD`, `TEACHER`,
  `MAINTENANCE_TECHNICIAN`) **cannot** be self-assigned via public sign-up. The
  `additionalFields.role` field is marked `input: false`, which means Better Auth
  refuses any client-supplied value.
- Public registration only creates `SUPPLIER` accounts (via `/api/auth-extras/register-supplier`).
- All privileged routes go through `requireAuth + requirePermission(...)`. The permission
  matrix lives in `packages/shared/src/permissions/index.ts` and is enforced on both server
  and client.
- All sensitive actions (role changes, blacklist, offer accept/reject, warranty decisions, etc.)
  are written to the `audit_logs` table.
