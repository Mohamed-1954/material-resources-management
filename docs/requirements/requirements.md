# Functional & non-functional requirements

## 1. Scope

The system manages the lifecycle of faculty hardware resources (computers, printers, …) across
departments. Communication between teachers, department heads, the resource manager,
suppliers, and maintenance technicians flows entirely through the platform.

## 2. Functional requirements

### F1. Authentication & access control
- F1.1 Every protected action requires authentication.
- F1.2 Authentication methods: email/password, GitHub OAuth, Google OAuth (Better Auth).
- F1.3 Privileged roles cannot be self-assigned via public sign-up. Suppliers may register their
  own company; all other internal accounts are admin-provisioned or seeded.

### F2. Department needs
- F2.1 A teacher can submit a need request listing computers and/or printers with
  technical specs and a justification.
- F2.2 Department heads can review, request changes, approve, or reject needs from their own
  department only.
- F2.3 An approved need can be sent to the resource manager.

### F3. Tenders
- F3.1 The resource manager can draft a tender, pull approved department needs into it,
  publish it, close it, start evaluation, and award it.
- F3.2 A published tender has a start and end date — only during this window can suppliers
  submit offers.

### F4. Supplier offers
- F4.1 Each offer line provides: brand, unit price, quantity, warranty (months), future delivery
  date, and optional technical details.
- F4.2 The total is computed server-side.
- F4.3 The resource manager can eliminate offers (with a reason), reject offers, or accept the
  lowest valid offer. Accepting an offer rejects the rest and awards the tender.
- F4.4 Blacklisted suppliers cannot submit offers and their existing submissions can be
  eliminated.

### F5. Inventory & assignment
- F5.1 Delivered resources receive a unique inventory code (`CPU-…` / `PRT-…`).
- F5.2 Computer-specific specs go to `computer_specs`; printer specs go to `printer_specs`.
- F5.3 A resource may have at most one **active** assignment, but full assignment history is
  preserved (rows are deactivated, not deleted).
- F5.4 Assignment can target a user or a department.

### F6. Maintenance
- F6.1 A teacher may report failures only on resources assigned to them or to their department.
- F6.2 Technicians can take, intervene, resolve, or escalate failures to severe.
- F6.3 Severe failures require a technical report (explanation, appearance date, frequency, type).
- F6.4 Printer failures must always have type `HARDWARE`.
- F6.5 The resource manager can request supplier repair or replacement only if the warranty is
  still active.

### F7. Notifications
- In-app notifications fan out for all major workflow events (need submitted, tender published,
  offer submitted/accepted/rejected, supplier eliminated, resource assigned, failure reported,
  technical report created, supplier repair requested).

### F8. Audit
- All sensitive actions are logged to `audit_logs` with user, action, entity, old and new values.

## 3. Non-functional requirements

| Quality | Implementation |
| --- | --- |
| Security | Better Auth (cookie sessions, OAuth), centralized RBAC matrix, server-side validation, no secrets in repo, audit log |
| Performance | Indexed columns on hot lookups (email, status, tender dates, assignment.active), TanStack Query caching |
| Maintainability | Modular monolith, shared package for schemas/types/permissions, focused service files, no large god-files |
| Testability | Pure-function services for state machines and selection logic, full unit-test coverage on those |
| Traceability | Audit table + status histories on tenders/offers/needs, assignment history preserved |
| Usability | Role-aware sidebar, status badges, empty/loading states, single dashboard per role |
| Data integrity | Foreign keys, soft retire instead of hard delete for resources, status transition validators |
| Extensibility | Permission matrix is data, not code branching; new modules follow the same skeleton |
