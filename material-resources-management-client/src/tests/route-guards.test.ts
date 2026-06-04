import { describe, expect, test } from "vitest";

import { ROLES, type Role } from "@frms/shared";

import { requireAuth, requirePermission, requireRole } from "@/lib/route-guards";
import type { AuthContext } from "@/lib/permissions";

interface RedirectError extends Error {
  options: { to: string; search?: { redirect?: string } };
}

function buildContext(overrides: Partial<AuthContext> = {}): { context: { auth: AuthContext } } {
  return {
    context: {
      auth: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        refresh: async () => {},
        signOut: async () => {},
        ...overrides,
      },
    },
  };
}

function buildAuthedUser(role: Role): AuthContext["user"] {
  return {
    id: "u1",
    email: "u@x.com",
    name: null,
    role,
    departmentId: null,
    supplierId: null,
  };
}

function captureRedirect(fn: () => void): RedirectError {
  try {
    fn();
  } catch (e) {
    return e as RedirectError;
  }
  throw new Error("Expected redirect to be thrown");
}

describe("requireAuth", () => {
  test("redirects to /login when unauthenticated", () => {
    const ctx = { ...buildContext(), location: { href: "/admin/users" } };
    const err = captureRedirect(() => requireAuth(ctx));
    expect(err.options.to).toBe("/login");
    expect(err.options.search?.redirect).toBe("/admin/users");
  });

  // NOTE: with async beforeLoad in __root, `isLoading` can no longer be `true`
  // at the time a guard runs — the root awaits `ensureQueryData` before any
  // child guard fires. We assert the post-await behavior: unauthenticated still
  // redirects regardless of the (now-impossible) loading flag.
  test("still redirects to /login if unauthenticated, even with a stale loading flag", () => {
    const ctx = {
      ...buildContext({ isLoading: true }),
      location: { href: "/x" },
    };
    const err = captureRedirect(() => requireAuth(ctx));
    expect(err.options.to).toBe("/login");
  });

  test("does nothing when authenticated", () => {
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.TEACHER),
      }),
      location: { href: "/x" },
    };
    expect(() => requireAuth(ctx)).not.toThrow();
  });
});

describe("requireRole", () => {
  test("redirects to /dashboard when role is wrong", () => {
    const guard = requireRole(ROLES.RESOURCE_MANAGER);
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.TEACHER),
      }),
      location: { href: "/manager/tenders" },
    };
    const err = captureRedirect(() => guard(ctx));
    expect(err.options.to).toBe("/dashboard");
  });

  test("ADMIN bypasses any role gate", () => {
    const guard = requireRole(ROLES.RESOURCE_MANAGER);
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.ADMIN),
      }),
      location: { href: "/manager/tenders" },
    };
    expect(() => guard(ctx)).not.toThrow();
  });

  test("matching role passes", () => {
    const guard = requireRole(ROLES.SUPPLIER);
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.SUPPLIER),
      }),
      location: { href: "/supplier/tenders" },
    };
    expect(() => guard(ctx)).not.toThrow();
  });

  test("redirects to /login when unauthenticated, regardless of allowed roles", () => {
    const guard = requireRole(ROLES.TEACHER);
    const ctx = { ...buildContext(), location: { href: "/teacher/needs" } };
    const err = captureRedirect(() => guard(ctx));
    expect(err.options.to).toBe("/login");
  });
});

describe("requirePermission", () => {
  test("redirects when role lacks the permission", () => {
    const guard = requirePermission("tender:manage");
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.TEACHER),
      }),
      location: { href: "/manager/tenders" },
    };
    const err = captureRedirect(() => guard(ctx));
    expect(err.options.to).toBe("/dashboard");
  });

  test("permits role that has the permission", () => {
    const guard = requirePermission("tender:manage");
    const ctx = {
      ...buildContext({
        isAuthenticated: true,
        user: buildAuthedUser(ROLES.RESOURCE_MANAGER),
      }),
      location: { href: "/manager/tenders" },
    };
    expect(() => guard(ctx)).not.toThrow();
  });
});
