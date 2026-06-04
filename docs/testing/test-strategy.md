# Testing strategy

## Layered approach

| Layer | Tooling | Targets |
| --- | --- | --- |
| Pure logic / state machines | `bun:test` | `needs.service.assertCanTransition`, `tenders.service.{assertTenderTransition, isTenderActive}`, `offers.service.{assertOfferTransition, computeOfferTotal, selectLowestValidOffer}`, `maintenance.service.{assertPrinterFailureIsHardware, isWarrantyValid}` |
| RBAC | `bun:test` | `hasPermission` for all role × permission combinations that matter |
| Validation | `bun:test` | Valibot schemas (e.g. printer-no-cpu, password length, ISO date enforcement) |
| UI primitives | Vitest + Testing Library | `StatusBadge`, `DataTable` empty/loading/data |
| Permission helpers (web) | Vitest | `userHasPermission` and `userHasRole` against the same shared matrix |
| (Out of prototype) E2E | Playwright | Supplier register → submit offer; Manager evaluate → accept; Teacher report → technician report → manager warranty action |

## Why this split

The state-machine and selection logic carry the most semantic risk in this domain — they
embody the academic business rules. We put them in *pure* services so they can be unit-tested
without DB or HTTP setup. This is intentional and is what gives us confidence every "tender
must follow the lifecycle" or "lowest valid offer wins" statement in the academic report.

The UI primitives only carry rendering risk; we test the few that actually have branching
(badge mapping, table empty/loading state).

## Running

```bash
bun --filter material-resources-management-api test
bun --filter material-resources-management-client test
# Or both:
bun run test
```

## Future extensions

- Add Playwright E2E coverage for the three golden journeys above. The fakes/seeds are
  already in `material-resources-management-api/src/db/seed.ts`.
- Add a small integration test pack against an ephemeral PostgreSQL service (the CI workflow
  already provisions one) covering at least: supplier submit-then-eliminate, manager accept
  re-rejecting siblings.
