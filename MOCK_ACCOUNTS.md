# Mock accounts — local seed

The `db:seed` script provisions one account per role plus a small set of domain data so every dashboard has content to render. All accounts share the same password and live only in the local Postgres volume — never use these on a deployed environment.

**Password (every account):** `changeme123`

| Email | Role | Department | Company | What the dashboard shows |
|---|---|---|---|---|
| `admin@faculty.local` | `ADMIN` | — | — | Users by role pie, 14-day audit activity bar, last 10 audit entries |
| `manager@faculty.local` | `RESOURCE_MANAGER` | — | — | Tender pipeline + offer-outcome bars, lists for tenders / needs / suppliers |
| `cs.head@faculty.local` | `DEPARTMENT_HEAD` | Computer Science (`CS`) | — | Needs-by-stage pie for the CS department, member roster |
| `math.head@faculty.local` | `DEPARTMENT_HEAD` | Mathematics (`MATH`) | — | Needs-by-stage pie for the Math department, member roster |
| `phys.head@faculty.local` | `DEPARTMENT_HEAD` | Physics (`PHYS`) | — | Needs-by-stage pie for the Physics department, member roster |
| `teacher@faculty.local` | `TEACHER` | Computer Science (`CS`) | — | Personal activity bar, my needs / my resources / quick-actions |
| `teacher2@faculty.local` | `TEACHER` | Computer Science (`CS`) | — | Second CS teacher with their own workstation + ML need request |
| `teacher3@faculty.local` | `TEACHER` | Computer Science (`CS`) | — | Third CS teacher with a rejected need request to show the reject path |
| `math.teacher@faculty.local` | `TEACHER` | Mathematics (`MATH`) | — | Approved printer need awaiting procurement |
| `phys.teacher@faculty.local` | `TEACHER` | Physics (`PHYS`) | — | Need forwarded to procurement plus a resolved failure |
| `tech@faculty.local` | `MAINTENANCE_TECHNICIAN` | — | — | Failures by status, technical-report intake |
| `tech2@faculty.local` | `MAINTENANCE_TECHNICIAN` | — | — | Second technician with the CS-PC-0006 technical report on record |
| `supplier@faculty.local` | `SUPPLIER` | — | Acme Hardware | Offers by status pie, acceptance-rate hero, active tenders feed |
| `supplier2@faculty.local` | `SUPPLIER` | — | Bluechip Tech | Competing supplier — open + rejected offers across the same tenders |

## Seeded domain data

Re-running the seed is **idempotent** — every helper checks for the row before inserting. You can safely run `db:seed` after every container rebuild.

- **Departments (6):** `CS`, `MATH`, `PHYS`, `ADMIN`, `ELEC`, `MECH`. Heads are assigned to `CS`, `MATH`, `PHYS`.
- **Suppliers (2):** `Acme Hardware` (owner = `supplier@faculty.local`) and `Bluechip Tech` (owner = `supplier2@faculty.local`).
- **Inventory (~18 resources):** mix of computers (Dell · HP · Lenovo) and printers (Brother · HP) spanning CS, Math, Physics, Electronics and Mechanical departments — including `CS-PC-0006` in `UNDER_MAINTENANCE` to exercise that branch.
- **Assignments (6):** personal workstations for the four teachers + a department-scoped printer for CS.
- **Tenders (5):**
  - `TND-2026-001` — PUBLISHED, lab computers, 30 units across two brands.
  - `TND-2026-002` — PUBLISHED, department printers, 4 units.
  - `TND-2026-003` — DRAFT, Mathematics lab workstations (not yet published).
  - `TND-2025-018` — AWARDED, Physics measurement workstations.
  - `TND-2025-019` — CLOSED, faculty printers.
- **Supplier offers (6):** spans `SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `ELIMINATED` so the offer-status dashboards are populated.
- **Need requests (6):** one per stage (`DRAFT`, `SUBMITTED`, `UNDER_DEPARTMENT_REVIEW`, `APPROVED_BY_DEPARTMENT`, `SENT_TO_RESOURCE_MANAGER`, `REJECTED`) across the three active departments.
- **Failure reports (5):** mixed across `REPORTED`, `ASSIGNED`, `RESOLVED`, `TECHNICAL_REPORT_CREATED` and all four severities. Includes one technical report against `CS-PC-0006`.
- **Notifications (12):** unread alerts for teachers, heads, manager, suppliers and technicians plus a couple of read items to mix the bell badge.

## Running the seed

From the host (recommended — uses the host-mapped port `15432`):

```pwsh
cd material-resources-management-api
bun run db:migrate   # only the first time, or after a schema change
bun run db:seed
```

From inside the running api container (handy in dev with the full compose stack up):

```pwsh
docker compose -f infra/docker-compose.yml exec api bun run src/db/seed.ts
```

## Sign-in flow

1. Open <http://localhost:5173>.
2. Pick an account from the table above; password `changeme123`.
3. After sign-in the router lands the user on `/dashboard` and renders the role-specific view.
4. Use the user menu (top-right) to sign out. Pressing the browser back button after sign-out re-runs the root `beforeLoad`, sees no session, and bounces back to `/login` — that is the gate working as intended.

## Rotating credentials

The seed hashes passwords through Better-Auth's `signUpEmail`. To rotate a password for an existing seed account, do it the normal way through the application or directly against the `account` table — do **not** edit the literal `'changeme123'` in `seed.ts` expecting existing users to get the new value; the helper only inserts when the user does not already exist.

## Rebuilding to pick up backend / frontend changes

Use these from the repo root after editing API code (`material-resources-management-api/`) or client code (`material-resources-management-client/`). The compose file already wires both services to their respective Dockerfiles, so `--build` is the only flag needed.

**Rebuild + restart the API and web containers (most common — after code edits):**

```pwsh
docker compose -f infra/docker-compose.yml up -d --build api web
```

**Rebuild only the API:**

```pwsh
docker compose -f infra/docker-compose.yml up -d --build api
```

**Rebuild only the web client:**

```pwsh
docker compose -f infra/docker-compose.yml up -d --build web
```

**Verify the containers are healthy and ports are mapped:**

```pwsh
docker compose -f infra/docker-compose.yml ps
```

**Tail live API logs (Ctrl+C to detach — the container keeps running):**

```pwsh
docker compose -f infra/docker-compose.yml logs -f api
```

**Smoke the API after a rebuild:**

```pwsh
curl http://localhost:3001/api/auth/ok       # expect: {"ok":true}
curl http://localhost:3001/health             # expect: {"data":{"status":"ok",...}}
```

The web UI is served at <http://localhost:5173>; the API listens on `http://localhost:3001`; Postgres is host-mapped on `15432`. Sign-in cookies are scoped to `localhost`, so the SPA and API share the session.

If only the schema changed (you ran `db:generate` and committed a new migration in `material-resources-management-api/drizzle/`), run the migration before reseeding:

```pwsh
docker compose -f infra/docker-compose.yml exec api bun run src/db/migrate.ts
docker compose -f infra/docker-compose.yml exec api bun run src/db/seed.ts
```

## Resetting the seed

If a re-run produces a constraint error (e.g. you partially seeded then changed a schema field), the cleanest reset is to wipe the Postgres volume:

```pwsh
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d --build
docker compose -f infra/docker-compose.yml exec api bun run src/db/migrate.ts
docker compose -f infra/docker-compose.yml exec api bun run src/db/seed.ts
```

`down -v` also drops the data volume — only use it when you intend to lose seeded data.
