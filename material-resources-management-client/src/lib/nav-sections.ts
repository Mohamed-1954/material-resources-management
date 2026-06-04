import {
  Building2,
  ClipboardList,
  Cog,
  FileText,
  Gauge,
  Gavel,
  Layers,
  PackageCheck,
  ScrollText,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

import { ROLES, type Role } from "@frms/shared";

export interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  roles: readonly Role[];
}

export interface NavSection {
  id: string;
  /** Path segment that maps to this section's landing page (e.g. "/admin"). */
  to: string | null;
  label: string;
  description: string;
  roles: readonly Role[];
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    to: null,
    label: "Overview",
    description: "Personal landing for every signed-in user.",
    roles: Object.values(ROLES),
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        description: "Your role-tailored summary of the faculty's resources.",
        icon: Gauge,
        roles: Object.values(ROLES),
      },
    ],
  },
  {
    id: "admin",
    to: "/admin",
    label: "Administration",
    description: "User accounts, departments, and a system-wide activity log.",
    roles: [ROLES.ADMIN],
    items: [
      {
        to: "/admin/users",
        label: "Users",
        description: "Invite teachers, technicians, managers and rotate roles.",
        icon: Users,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/departments",
        label: "Departments",
        description: "Create departments and assign their heads.",
        icon: Building2,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin/audit-logs",
        label: "Audit logs",
        description: "Sensitive actions across the system, newest first.",
        icon: ShieldCheck,
        roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    id: "manager",
    to: "/manager",
    label: "Resource manager",
    description: "Procurement pipeline — from tender to supplier to warranty.",
    roles: [ROLES.RESOURCE_MANAGER],
    items: [
      {
        to: "/manager/tenders",
        label: "Tenders",
        description: "Publish calls for offers, evaluate suppliers, award.",
        icon: Gavel,
        roles: [ROLES.RESOURCE_MANAGER],
      },
      {
        to: "/manager/resources",
        label: "Resources",
        description: "Faculty-wide inventory of computers and printers.",
        icon: Layers,
        roles: [ROLES.RESOURCE_MANAGER],
      },
      {
        to: "/manager/suppliers",
        label: "Suppliers",
        description: "Registered companies eligible to submit offers.",
        icon: PackageCheck,
        roles: [ROLES.RESOURCE_MANAGER],
      },
      {
        to: "/manager/maintenance-decisions",
        label: "Warranty decisions",
        description: "Replace or repair calls for resources still in warranty.",
        icon: Cog,
        roles: [ROLES.RESOURCE_MANAGER],
      },
    ],
  },
  {
    id: "department",
    to: "/department",
    label: "Department",
    description: "Review and route need requests submitted by your teachers.",
    roles: [ROLES.DEPARTMENT_HEAD],
    items: [
      {
        to: "/department/needs",
        label: "Department needs",
        description: "Approve teacher requests and send them to procurement.",
        icon: ClipboardList,
        roles: [ROLES.DEPARTMENT_HEAD],
      },
      {
        to: "/department/resources",
        label: "Department resources",
        description: "Inventory assigned to people in your department.",
        icon: Layers,
        roles: [ROLES.DEPARTMENT_HEAD],
      },
    ],
  },
  {
    id: "teacher",
    to: "/teacher",
    label: "Teacher",
    description: "Your assigned equipment and the requests you have filed.",
    roles: [ROLES.TEACHER],
    items: [
      {
        to: "/teacher/resources",
        label: "My resources",
        description: "Equipment currently assigned to you.",
        icon: Layers,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/needs",
        label: "My needs",
        description: "Draft, submit and track new equipment requests.",
        icon: ClipboardList,
        roles: [ROLES.TEACHER],
      },
      {
        to: "/teacher/failures",
        label: "Report failure",
        description: "Open a failure ticket for a piece of equipment.",
        icon: Wrench,
        roles: [ROLES.TEACHER],
      },
    ],
  },
  {
    id: "supplier",
    to: "/supplier",
    label: "Supplier",
    description: "Tenders open to you, your offers, and your company profile.",
    roles: [ROLES.SUPPLIER],
    items: [
      {
        to: "/supplier/tenders",
        label: "Active tenders",
        description: "Open calls for offers that match your capabilities.",
        icon: Gavel,
        roles: [ROLES.SUPPLIER],
      },
      {
        to: "/supplier/offers",
        label: "My offers",
        description: "Drafts, submitted offers and award outcomes.",
        icon: FileText,
        roles: [ROLES.SUPPLIER],
      },
      {
        to: "/supplier/profile",
        label: "Company profile",
        description: "Information visible to evaluators when judging offers.",
        icon: Building2,
        roles: [ROLES.SUPPLIER],
      },
    ],
  },
  {
    id: "maintenance",
    to: "/maintenance",
    label: "Maintenance",
    description: "Failures reported by the faculty and your technical reports.",
    roles: [ROLES.MAINTENANCE_TECHNICIAN],
    items: [
      {
        to: "/maintenance/failures",
        label: "Failures",
        description: "Queue of reported equipment failures, by severity.",
        icon: Wrench,
        roles: [ROLES.MAINTENANCE_TECHNICIAN],
      },
      {
        to: "/maintenance/reports",
        label: "Technical reports",
        description: "Diagnostic reports filed against resolved failures.",
        icon: ScrollText,
        roles: [ROLES.MAINTENANCE_TECHNICIAN],
      },
    ],
  },
];

export function getSection(id: string): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.id === id);
}
