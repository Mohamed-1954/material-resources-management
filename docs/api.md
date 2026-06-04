# API surface

All non-auth endpoints live under `/api/*`. Better Auth mounts at `/api/auth/*`.

## Response envelope

```ts
// success
{ "data": T, "meta"?: { page?, pageSize?, total? } }
// error
{ "error": { "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "BUSINESS_RULE_VIOLATION" | "INTERNAL_SERVER_ERROR", "message": string, "details"?: unknown } }
```

## Auth (Better Auth)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/sign-up/email` | Email/password registration (default role TEACHER) |
| POST | `/api/auth/sign-in/email` | Email/password login |
| GET  | `/api/auth/session` | Current session |
| POST | `/api/auth/sign-out` | End session |
| GET  | `/api/auth/sign-in/social/github` | GitHub OAuth |
| GET  | `/api/auth/sign-in/social/google` | Google OAuth |
| POST | `/api/auth-extras/register-supplier` | **Custom** public supplier registration |

## Users

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/api/users` | `user:manage` |
| GET | `/api/users/me` | authenticated |
| GET | `/api/users/roles` | authenticated |
| POST | `/api/users` | `user:manage` |
| PATCH | `/api/users/:id` | `user:manage` |
| PATCH | `/api/users/:id/role` | `role:assign` |
| PATCH | `/api/users/:id/status` | `user:manage` |

## Departments

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/api/departments` | authenticated |
| POST | `/api/departments` | `department:manage` |
| PATCH | `/api/departments/:id` | `department:manage` |
| DELETE | `/api/departments/:id` | `department:manage` |
| GET | `/api/departments/:id/members` | authenticated |
| POST | `/api/departments/:id/members` | `department:manage` |
| DELETE | `/api/departments/:id/members/:userId` | `department:manage` |
| PATCH | `/api/departments/:id/head` | `department:manage` |

## Needs

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/needs` | scoped per role |
| POST | `/api/needs` | teacher only — must be a department member |
| POST | `/api/needs/:id/{submit\|approve\|reject\|request-changes\|send-to-resource-manager}` | state transitions |
| GET / POST | `/api/needs/by-department/:departmentId[/finalize\|/send-to-resource-manager]` | dept head bulk ops |

## Tenders

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/tenders` / `/api/tenders/active` | suppliers see only active windows |
| POST | `/api/tenders` | manager — DRAFT |
| POST | `/api/tenders/:id/{publish\|close\|start-evaluation\|cancel}` | state transitions |
| POST | `/api/tenders/:id/items` / DELETE | tender line items |
| POST | `/api/tenders/:id/include-needs` | pull `SENT_TO_RESOURCE_MANAGER` needs into tender |

## Suppliers

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/suppliers` | `supplier:manage` |
| GET | `/api/suppliers/me` | the supplier's own profile |
| PATCH | `/api/suppliers/:id` | self or admin/manager |
| POST | `/api/suppliers/:id/blacklist` | `supplier:blacklist` (reason required) |
| POST | `/api/suppliers/:id/remove-from-blacklist` | `supplier:blacklist` |

## Offers

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/offers` | scoped — supplier sees own |
| POST | `/api/offers/by-tender/:tenderId` | only when tender is active and supplier not blacklisted |
| POST | `/api/offers/:id/{submit\|withdraw}` | by the supplier |
| POST | `/api/offers/:id/{eliminate\|accept\|reject}` | manager (eliminate/reject require reason) |

`accept` enforces the lowest-valid-offer rule, REJECTs other open offers and AWARDs the tender.

## Resources / inventory

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/resources` / `/available` / `/_/unassigned` / `/_/orphaned` | listings |
| POST | `/api/resources/register-delivery` | requires accepted offer; auto-generates inventory codes |
| DELETE | `/api/resources/:id` | soft retire |

## Assignments

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/assignments/my` | teacher's resources (personal + department) |
| GET | `/api/assignments/by-{user\|department\|resource}/:id` | filtered |
| POST | `/api/assignments/by-resource/:id` | assign — fails if an active assignment exists |
| POST | `/api/assignments/by-resource/:id/unassign` | closes the active row, preserves history |

## Failures / maintenance

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/failures` | scoped per role |
| POST | `/api/failures` | teacher must own/access the resource |
| POST | `/api/failures/:id/{assign-technician\|start-intervention\|resolve\|mark-severe}` | technician |
| POST | `/api/failures/:id/technical-report` | requires status `SEVERE`, enforces printer-hardware-only rule |
| POST | `/api/failures/:id/{request-supplier-repair\|request-replacement}` | manager — warranty must be active |

## Notifications & Audit

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/notifications` / `/unread` | own inbox |
| PATCH | `/api/notifications/:id/read` / `/read-all` | mark read |
| GET | `/api/audit-logs` | `audit:view` (admin) |
| GET | `/api/audit-logs/by-entity/:type/:id` | per-entity history |
