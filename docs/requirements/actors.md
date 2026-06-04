# Actors

| Actor | Role code | Primary responsibilities |
| --- | --- | --- |
| System administrator | `ADMIN` | Manage users, roles, departments, audit logs |
| Resource manager | `RESOURCE_MANAGER` | Draft/publish tenders, evaluate offers, manage suppliers (blacklist), register deliveries, assign resources, decide warranty actions |
| Department head | `DEPARTMENT_HEAD` | Review, request changes, approve, finalize and send department needs to the resource manager |
| Teacher | `TEACHER` | Submit need requests, view own resources, report failures on assigned resources |
| Supplier | `SUPPLIER` | Register own company, view active tenders, submit offers, update profile |
| Maintenance technician | `MAINTENANCE_TECHNICIAN` | Take, intervene on, resolve or escalate failures; write technical reports for severe failures |

The full permission matrix lives in `packages/shared/src/permissions/index.ts` and is enforced on
both API and Web. Both layers consume the same source of truth, so they cannot drift.
