import { lazy, Suspense, type ComponentType } from "react";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";

import type { Role } from "@frms/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { roleLabel } from "@/lib/role-labels";

import { DashboardSkeleton } from "../DashboardSkeleton";

// Each role-dashboard is its own chunk. Recharts and the per-role queries are
// loaded only when the matching user actually lands on /dashboard.
const AdminDashboard = lazy(() =>
  import("../AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const ManagerDashboard = lazy(() =>
  import("../ManagerDashboard").then((m) => ({ default: m.ManagerDashboard })),
);
const DepartmentHeadDashboard = lazy(() =>
  import("../DepartmentHeadDashboard").then((m) => ({ default: m.DepartmentHeadDashboard })),
);
const TeacherDashboard = lazy(() =>
  import("../TeacherDashboard").then((m) => ({ default: m.TeacherDashboard })),
);
const SupplierDashboard = lazy(() =>
  import("../SupplierDashboard").then((m) => ({ default: m.SupplierDashboard })),
);
const TechnicianDashboard = lazy(() =>
  import("../TechnicianDashboard").then((m) => ({ default: m.TechnicianDashboard })),
);

const DASHBOARD_FOR: Record<Role, ComponentType> = {
  ADMIN: AdminDashboard,
  RESOURCE_MANAGER: ManagerDashboard,
  DEPARTMENT_HEAD: DepartmentHeadDashboard,
  TEACHER: TeacherDashboard,
  SUPPLIER: SupplierDashboard,
  MAINTENANCE_TECHNICIAN: TechnicianDashboard,
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const auth = useAuth();
  if (!auth.user) return null;

  const friendly = roleLabel(auth.user.role);
  const displayName = auth.user.name ?? auth.user.email.split("@")[0];
  const RoleDashboard = DASHBOARD_FOR[auth.user.role];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <>
            <Sparkles className="size-3" />
            <span>{friendly}</span>
          </>
        }
        title={`${greeting()}, ${displayName}`}
        description="Track the state of resources, tenders, needs, and maintenance across the faculty."
        meta={
          <>
            <span>{format(new Date(), "EEEE, d MMMM yyyy")}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[40ch]">Signed in as {auth.user.email}</span>
          </>
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <RoleDashboard />
      </Suspense>
    </div>
  );
}
