# Faculty Material Resources Management Client — Frontend Architecture & Conventions

> Purpose: This document is the frontend source of truth for structure, naming, UI composition, data fetching, forms, validation, routing, permissions, and quality gates.
>
> This project is a React + TanStack + shadcn/ui + Base UI frontend inside a modular monolith. Do not import conventions from unrelated stacks unless they are verified against this repository.

---

## 1. Project Stack

| Category                  | Technology                     | Rule                                                                                                                                           |
| ------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime / package manager | Bun                            | Use `bun install`, `bun run <script>`, and Bun-compatible scripts. Do not introduce pnpm/npm/yarn workflows unless the repo already uses them. |
| Framework                 | React 19 + TypeScript          | Functional components and hooks only. Prefer strict types and explicit domain contracts.                                                       |
| Build tool                | Vite                           | Preserve existing Vite/TanStack Router integration.                                                                                            |
| Routing                   | TanStack Router, file-based    | Routes live in `src/routes/`. Do not add React Router or a separate `src/router/` folder.                                                      |
| Server state              | TanStack Query                 | All remote data fetching, caching, invalidation, and mutation state belongs here. Do not introduce Redux/RTK Query.                            |
| Forms                     | TanStack Form                  | Use for all non-trivial forms.                                                                                                                 |
| Validation                | Valibot                        | Use schema-first validation and infer TypeScript types from schemas.                                                                           |
| Styling                   | Tailwind CSS                   | Prefer design tokens, consistent spacing, responsive layouts, and accessible states.                                                           |
| UI                        | shadcn/ui + Base UI primitives | `components/ui/` is CLI/registry-managed. Custom compositions live outside `ui/`.                                                              |
| Auth                      | Better Auth client             | Auth/session logic belongs in `src/lib/auth-client` or a clearly named auth feature.                                                           |
| Permissions               | Shared RBAC matrix             | Use `packages/shared` permission definitions where available. Do not duplicate role/permission truth in UI code.                               |
| Tests                     | Vitest + Testing Library       | Test behavior, permissions, forms, routing, and important data flows.                                                                          |

---

## 2. Repository Context

The frontend app lives at:

```txt
material-resources-management-client/
└── src/
    ├── components/
    ├── features/
    ├── lib/
    └── routes/
```

Shared types, schemas, constants, and RBAC definitions live in:

```txt
packages/shared/
```

The frontend must consume shared contracts from `packages/shared` whenever possible instead of redefining equivalent types, enums, validation rules, or permission matrices.

---

## 3. Top-Level Frontend Structure

Use this target structure unless the existing repository has a well-justified equivalent:

```txt
material-resources-management-client/
└── src/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── feedback/
    │   ├── data-display/
    │   ├── forms/
    │   └── theme/
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboards/
    │   ├── departments/
    │   ├── needs/
    │   ├── tenders/
    │   ├── suppliers/
    │   ├── offers/
    │   ├── inventory/
    │   ├── assignments/
    │   ├── maintenance/
    │   ├── notifications/
    │   └── audit/
    │
    ├── hooks/
    ├── lib/
    │   ├── api-client.ts
    │   ├── auth-client.ts
    │   ├── query-client.ts
    │   ├── permissions.ts
    │   ├── route-guards.ts
    │   ├── errors.ts
    │   └── utils.ts
    │
    ├── routes/
    ├── test/
    ├── types/
    ├── main.tsx
    ├── routeTree.gen.ts
    └── index.css
```

Rules:

- `routes/` is for TanStack Router route files only.
- `features/` is for business-domain UI, hooks, data access, schemas, and page-level compositions.
- `components/` is for reusable UI that is not owned by one business domain.
- `lib/` is for cross-cutting infrastructure.
- `packages/shared` is the source of truth for shared domain contracts and permissions.

---

## 4. Routing — TanStack Router File-Based Rules

This repository uses TanStack Router file-based routing. Do not replace it with React Router.

Route files belong in:

```txt
src/routes/
```

Recommended route organization:

```txt
routes/
├── __root.tsx
├── index.tsx
├── login.tsx
├── register-supplier.tsx
├── _authenticated.tsx
├── _authenticated/
│   ├── dashboard.tsx
│   ├── needs/
│   │   ├── index.tsx
│   │   ├── $needId.tsx
│   │   └── new.tsx
│   ├── tenders/
│   │   ├── index.tsx
│   │   └── $tenderId.tsx
│   └── inventory/
│       ├── index.tsx
│       └── $itemId.tsx
└── not-found.tsx
```

Rules:

- Use file-based routing conventions already configured in the project.
- Keep route files thin.
- Route files should compose feature-owned pages, guards, loaders, and layouts.
- Do not put large UI implementations directly inside route files.
- Use route-level guards for authentication and permissions.
- Use search params for URL-state such as filters, tabs, sorting, and pagination when the state should be shareable/bookmarkable.
- Keep generated route files generated. Do not hand-edit `routeTree.gen.ts`.

Pattern:

```tsx
// src/routes/_authenticated/needs/index.tsx
import { createFileRoute } from "@tanstack/react-router";

import { NeedsListPage } from "@/features/needs/pages/NeedsListPage";

export const Route = createFileRoute("/_authenticated/needs/")({
  component: NeedsListPage,
});
```

---

## 5. Feature Structure

Each business domain gets a feature folder.

```txt
features/<feature-name>/
├── pages/
│   └── <PageName>.tsx
├── components/
├── hooks/
├── queries/
├── mutations/
├── schemas.ts
├── types.ts
├── constants.ts
└── utils.ts
```

Use only the files/folders needed. Do not create empty folders for symmetry.

Example:

```txt
features/needs/
├── pages/
│   ├── NeedsListPage.tsx
│   ├── NeedDetailsPage.tsx
│   └── CreateNeedPage.tsx
├── components/
│   ├── NeedStatusBadge.tsx
│   ├── NeedForm.tsx
│   └── NeedsTable.tsx
├── hooks/
│   └── use-need-permissions.ts
├── queries/
│   ├── need-query-keys.ts
│   └── use-needs-query.ts
├── mutations/
│   ├── use-create-need-mutation.ts
│   └── use-update-need-status-mutation.ts
├── schemas.ts
├── types.ts
├── constants.ts
└── utils.ts
```

Decision rules:

```txt
Used by one page only?
  → features/<feature>/pages or page-local component.

Used by multiple pages in one feature?
  → features/<feature>/components, hooks, utils, etc.

Used by multiple features?
  → src/components, src/hooks, src/lib, or packages/shared.

Domain contract already exists in packages/shared?
  → Import from packages/shared. Do not duplicate.
```

---

## 6. Data Fetching — TanStack Query

TanStack Query owns server state.

Rules:

- Use `useQuery` for reads.
- Use `useMutation` for writes.
- Use stable query keys.
- Centralize query keys per feature.
- Invalidate or update affected queries after mutations.
- Do not store server data in React context or local component state except as derived/transient UI state.
- Do not introduce Redux or RTK Query.

Feature query key pattern:

```ts
// features/needs/queries/need-query-keys.ts
export const needQueryKeys = {
  all: ["needs"] as const,
  lists: () => [...needQueryKeys.all, "list"] as const,
  list: (filters: NeedListFilters) =>
    [...needQueryKeys.lists(), filters] as const,
  details: () => [...needQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...needQueryKeys.details(), id] as const,
};
```

Query hook pattern:

```ts
// features/needs/queries/use-needs-query.ts
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { needQueryKeys } from "./need-query-keys";

export function useNeedsQuery(filters: NeedListFilters) {
  return useQuery({
    queryKey: needQueryKeys.list(filters),
    queryFn: () => apiClient.needs.list(filters),
  });
}
```

Mutation hook pattern:

```ts
// features/needs/mutations/use-create-need-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { needQueryKeys } from "../queries/need-query-keys";

export function useCreateNeedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.needs.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: needQueryKeys.lists() });
      toast.success("Need created successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create need."));
    },
  });
}
```

---

## 7. API Client

The frontend should have one API access layer.

Recommended files:

```txt
lib/
├── api-client.ts
├── auth-client.ts
├── query-client.ts
├── errors.ts
└── permissions.ts
```

Rules:

- Keep raw `fetch` calls out of components.
- Keep endpoint functions in `api-client.ts` or feature-scoped API files if the app grows large.
- Normalize errors in one place.
- Include credentials/session handling according to Better Auth requirements.
- Never hardcode API URLs inside feature components.
- Use shared request/response types from `packages/shared` where available.

Example shape:

```ts
export const apiClient = {
  needs: {
    list: (filters: NeedListFilters) =>
      request<NeedListResponse>("/api/needs", { searchParams: filters }),

    create: (body: CreateNeedInput) =>
      request<CreateNeedResponse>("/api/needs", {
        method: "POST",
        body,
      }),
  },
};
```

---

## 8. Authentication and Authorization

The backend security model relies on Better Auth, server-side route protection, and a shared permission matrix. The frontend must reflect these constraints without pretending to be the security boundary.

Rules:

- The server is the source of truth for authorization.
- The client may hide or disable UI based on permissions, but must not assume this is enforcement.
- Use shared permission definitions from `packages/shared`.
- Do not duplicate role strings manually across components.
- Public registration must only expose supplier registration flows.
- Do not expose privileged role selection in public UI.
- Handle unauthorized and forbidden states explicitly.

Recommended helpers:

```txt
lib/
├── auth-client.ts
├── permissions.ts
└── route-guards.ts
```

Example:

```ts
export function canAccessDashboard(user: CurrentUser | null) {
  if (!user) return false;
  return hasPermission(user.role, "dashboard:read");
}
```

---

## 9. Forms and Validation

Use TanStack Form + Valibot.

Rules:

- Every non-trivial form gets a Valibot schema.
- Export inferred input/output types from schemas.
- Keep schemas feature-scoped unless reused.
- Promote shared schema fragments to `packages/shared` or `src/lib/validation`.
- Do not manually duplicate backend validation rules when shared schemas are available.
- Use accessible field markup and shadcn/Base UI form primitives consistently.

Recommended feature schema:

```ts
// features/needs/schemas.ts
import * as v from "valibot";

export const createNeedSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, "Title is required")),
  description: v.pipe(v.string(), v.minLength(1, "Description is required")),
  priority: v.picklist(["LOW", "MEDIUM", "HIGH"]),
});

export type CreateNeedInput = v.InferOutput<typeof createNeedSchema>;
```

Recommended form pattern:

```tsx
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createNeedSchema, type CreateNeedInput } from "../schemas";
import { useCreateNeedMutation } from "../mutations/use-create-need-mutation";

export function NeedForm() {
  const createNeed = useCreateNeedMutation();

  const form = useForm<CreateNeedInput>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
    },
    validators: {
      onSubmit: createNeedSchema,
    },
    onSubmit: async ({ value }) => {
      await createNeed.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <Button type="submit" disabled={createNeed.isPending}>
          Create need
        </Button>
      </FieldGroup>
    </form>
  );
}
```

---

## 10. shadcn/ui and Base UI Rules

`src/components/ui/` is reserved for shadcn/ui generated or registry-managed components.

Rules:

- Do not put feature-specific components in `components/ui/`.
- Do not heavily modify generated primitives unless the change is intentional and documented.
- Prefer wrappers/compositions outside `ui/`.
- Use Base UI primitives for accessible low-level behavior when building custom components.
- Keep styling in Tailwind classes and design tokens.
- Preserve accessibility props, refs, keyboard behavior, focus management, and ARIA behavior from primitives.

Recommended component folders:

```txt
components/
├── ui/             # shadcn/ui primitives
├── layout/         # app shell, nav, sidebar, header
├── forms/          # reusable form compositions
├── feedback/       # empty states, alerts, loading, error cards
├── data-display/   # tables, cards, status badges, KPI cards
└── theme/          # theme provider/toggle
```

Custom component rules:

- Use named exports.
- Type props with `React.ComponentProps<...>` where possible.
- Preserve native element props.
- Preserve `ref` support where Base UI composition requires it.
- Use `data-slot` on reusable component roots where useful.
- Avoid over-abstracting before reuse is real.

Example:

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = React.ComponentProps<"header"> & {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
```

---

## 11. UI Redesign Standards

The current frontend may be visually weak; improve it systematically, not randomly.

Design principles:

- Use a coherent app shell: sidebar/header, breadcrumbs, user menu, role-aware navigation.
- Use consistent page headers.
- Use cards for grouped information, not for every small element.
- Use tables for administrative data, with empty/loading/error states.
- Use responsive layouts.
- Use clear hierarchy: title, description, primary actions, filters, content.
- Use consistent status badges for domain states.
- Use destructive styles only for destructive actions.
- Use skeletons for loading where layout stability matters.
- Use empty states with a clear next action.
- Use dialogs/sheets/drawers intentionally; do not hide primary workflows unnecessarily.
- Keep academic/project context professional, clean, and maintainable.

Each redesigned page must have:

- Loading state.
- Empty state.
- Error state.
- Permission-aware actions.
- Keyboard-accessible interactions.
- Responsive behavior.
- No duplicated business constants.

---

## 12. Shared Types and Contracts

Use `packages/shared` for:

- Role names.
- Permission matrix.
- Shared constants.
- Shared schemas.
- Shared request/response types.
- Domain enums.

Rules:

- Do not redefine shared roles in the client.
- Do not redefine domain status strings if they exist in shared code.
- Do not create frontend-only schemas that conflict with backend validation.
- If shared contracts are missing, add them to `packages/shared` only when both API and client benefit.

---

## 13. State Management

Use the smallest sufficient state.

| State kind              | Owner                                                     |
| ----------------------- | --------------------------------------------------------- |
| Server data             | TanStack Query                                            |
| Form state              | TanStack Form                                             |
| Auth session            | Better Auth client / query wrapper                        |
| URL state               | TanStack Router search params                             |
| Local UI state          | `useState` / `useReducer`                                 |
| Cross-app UI preference | Context or small persistent store only if already present |

Rules:

- Do not add Redux.
- Do not duplicate TanStack Query data in local state.
- Do not store form state globally.
- Prefer URL search params for filters/sorting/pagination that should survive refresh or sharing.

---

## 14. Error Handling

Rules:

- Normalize API errors in `src/lib/errors.ts`.
- Show user-friendly messages.
- Do not leak raw stack traces or sensitive backend messages.
- Use route-level error boundaries where appropriate.
- Use component-level error boundaries only for isolated widgets that can fail independently.
- Always handle forbidden/unauthorized states intentionally.

Recommended helper:

```ts
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
```

---

## 15. Testing Conventions

Use Vitest + Testing Library for frontend tests.

Test files:

```txt
ComponentName.test.tsx
hook-name.test.ts
FeatureName.integration.test.tsx
```

Placement:

```txt
features/<feature>/
├── components/
│   └── __tests__/
├── pages/
│   └── __tests__/
└── hooks/
    └── __tests__/
```

Shared test utilities:

```txt
src/test/
├── render.tsx
├── mocks/
└── fixtures/
```

Priorities:

1. Permission-sensitive UI.
2. Forms and validation.
3. Query/mutation behavior.
4. Route guard behavior.
5. Complex tables and filters.
6. Critical empty/loading/error states.

Do not over-test pure styling.

---

## 16. File Naming

| Category       | Convention                    | Example                             |
| -------------- | ----------------------------- | ----------------------------------- |
| Components     | PascalCase `.tsx`             | `NeedsTable.tsx`                    |
| Pages          | PascalCase with `Page` suffix | `NeedsListPage.tsx`                 |
| Hooks          | kebab-case with `use-` prefix | `use-need-permissions.ts`           |
| Query hooks    | `use-*-query.ts`              | `use-needs-query.ts`                |
| Mutation hooks | `use-*-mutation.ts`           | `use-create-need-mutation.ts`       |
| Query keys     | `*-query-keys.ts`             | `need-query-keys.ts`                |
| Schemas        | `schemas.ts`                  | `features/needs/schemas.ts`         |
| Constants      | `constants.ts`                | `features/needs/constants.ts`       |
| Utilities      | kebab-case `.ts`              | `format-status.ts`                  |
| Tests          | `.test.ts(x)`                 | `NeedsTable.test.tsx`               |
| Route files    | TanStack Router convention    | `$needId.tsx`, `_authenticated.tsx` |

Rules:

- One primary component per file.
- Avoid `index.tsx` for normal components.
- Use barrel files sparingly.
- Prefer direct imports unless a barrel materially improves ergonomics.

---

## 17. Import Rules

Order imports as:

```ts
// 1. React/framework
import * as React from "react";
import { Link } from "@tanstack/react-router";

// 2. Third-party
import { useQuery } from "@tanstack/react-query";
import * as v from "valibot";

// 3. Shared package
import { permissions } from "@faculty/shared/permissions";

// 4. Global app imports
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

// 5. Feature-relative imports
import { needQueryKeys } from "../queries/need-query-keys";

// 6. Local imports
import { NeedStatusBadge } from "./NeedStatusBadge";
```

Rules:

- Use the configured `@/` alias for app-level imports.
- Use package imports for `packages/shared`.
- Use relative imports only within the same feature or local folder.
- Do not import directly across feature internals unless the imported code has been promoted to shared/global.

---

## 18. Accessibility Rules

Every interactive UI must be accessible.

Rules:

- Use semantic HTML first.
- Preserve Base UI and shadcn accessibility behavior.
- Ensure dialogs, menus, popovers, selects, and comboboxes are keyboard accessible.
- Always provide labels for form controls.
- Use `aria-invalid` for invalid fields.
- Do not rely on color alone for meaning.
- Ensure focus states are visible.
- Ensure destructive actions require clear confirmation when irreversible.

---

## 19. Quality Gates

Before considering frontend work complete, run:

```bash
bun install
bun run typecheck
bun run test
bun run build
```

If the repository has lint/format scripts, also run them:

```bash
bun run lint
bun run format
```

No task is complete if:

- TypeScript fails.
- Tests fail.
- Build fails.
- Routes are broken.
- Generated route tree is stale.
- UI has missing loading/error/empty states.
- Permission-sensitive controls are exposed incorrectly.
- Deprecated package APIs are used without documented reason.

---

## 20. Documentation Retrieval Standard

Before implementing or refactoring code that depends on package-specific APIs, verify the current documentation.

Use the available MCP documentation server first. When useful, also inspect package `llms.txt` or `llms-full.txt`.

Required verification targets when touched:

- React 19
- TanStack Router
- TanStack Query
- TanStack Form
- Valibot
- shadcn/ui
- Base UI
- Tailwind CSS
- Better Auth
- Vitest
- Testing Library
- Vite
- Bun

Rules:

- Do not rely on memory for package APIs.
- Do not use deprecated APIs.
- Do not mix examples from incompatible versions.
- If docs and existing code disagree, investigate before changing.
- If a migration is needed, document why.

---

## 21. Common Pitfalls

| Pitfall                                      | Correct approach                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Adding React Router                          | Use TanStack Router file-based routes.                                       |
| Adding Redux or RTK Query                    | Use TanStack Query for server state.                                         |
| Putting route logic inside components        | Keep route definitions in `src/routes`; compose feature pages.               |
| Putting all UI inside route files            | Move substantial UI to `features/<feature>/pages` or components.             |
| Duplicating roles/permissions                | Import from `packages/shared`.                                               |
| Duplicating backend validation               | Reuse shared schemas when available.                                         |
| Editing generated route files manually       | Regenerate through the configured TanStack Router workflow.                  |
| Putting custom components in `components/ui` | Keep `ui` for shadcn/registry primitives; put custom compositions elsewhere. |
| Fetching data directly in components         | Use feature query/mutation hooks.                                            |
| Ignoring loading/error/empty states          | Every data-driven page must handle all three.                                |
