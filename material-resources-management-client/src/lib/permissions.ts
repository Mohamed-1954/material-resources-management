import { hasAnyRole, hasPermission, type Permission, type Role } from "@frms/shared";

export interface AuthContext {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    departmentId: string | null;
    supplierId: string | null;
  } | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function userHasPermission(
  user: AuthContext["user"],
  permission: Permission,
): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}

export function userHasRole(user: AuthContext["user"], roles: readonly Role[]): boolean {
  if (!user) return false;
  return hasAnyRole(user.role, roles);
}
