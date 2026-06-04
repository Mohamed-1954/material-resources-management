import { redirect } from "@tanstack/react-router";

import { hasAnyRole, hasPermission, type Permission, type Role } from "@frms/shared";

import type { AuthContext } from "./permissions";

interface BeforeLoadContext {
  context: { auth: AuthContext };
  location: { href: string };
}

interface GateOptions {
  /** Allowed roles. ADMIN is always implicitly allowed. */
  roles?: readonly Role[];
  /** Required permission via the shared RBAC matrix. */
  permission?: Permission;
}

/**
 * Unified beforeLoad gate. Combines auth + role + permission checks so route
 * files declare one intent instead of stacking three. The exported aliases
 * below preserve existing call sites.
 *
 * Order of failure: unauthenticated -> /login (with redirect search param);
 * authenticated but wrong role/permission -> /dashboard.
 */
export function gate(options: GateOptions = {}): (ctx: BeforeLoadContext) => void {
  return ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
    const role = context.auth.user?.role;
    if (!role) {
      throw redirect({ to: "/dashboard", replace: true });
    }
    if (role === "ADMIN") return;
    if (options.roles && !hasAnyRole(role, options.roles)) {
      throw redirect({ to: "/dashboard", replace: true });
    }
    if (options.permission && !hasPermission(role, options.permission)) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  };
}

/** Redirects to `/login` if unauthenticated. */
export const requireAuth = gate();

/** Allows any of the listed roles. ADMIN is implicitly allowed. */
export function requireRole(...allowed: Role[]): (ctx: BeforeLoadContext) => void {
  return gate({ roles: allowed });
}

/** Requires a specific permission via the shared RBAC matrix. */
export function requirePermission(permission: Permission): (ctx: BeforeLoadContext) => void {
  return gate({ permission });
}
