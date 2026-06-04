import type { Role } from "@frms/shared";

const FRIENDLY: Record<Role, string> = {
  ADMIN: "Administrator",
  RESOURCE_MANAGER: "Resource manager",
  DEPARTMENT_HEAD: "Department head",
  TEACHER: "Teacher",
  SUPPLIER: "Supplier",
  MAINTENANCE_TECHNICIAN: "Maintenance technician",
};

const SHORT: Record<Role, string> = {
  ADMIN: "Admins",
  RESOURCE_MANAGER: "Managers",
  DEPARTMENT_HEAD: "Heads",
  TEACHER: "Teachers",
  SUPPLIER: "Suppliers",
  MAINTENANCE_TECHNICIAN: "Technicians",
};

/** Title-cased, human-friendly role label (e.g. "Maintenance technician"). */
export function roleLabel(role: Role | string): string {
  return FRIENDLY[role as Role] ?? role;
}

/** Pluralized, abbreviated form for charts/legends (e.g. "Technicians"). */
export function roleLabelShort(role: Role | string): string {
  return SHORT[role as Role] ?? role;
}
