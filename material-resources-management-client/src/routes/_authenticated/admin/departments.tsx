import { createFileRoute } from "@tanstack/react-router";

import { DepartmentsPage } from "@/features/departments/pages/DepartmentsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/departments")({
  beforeLoad: requireRole("ADMIN"),
  component: DepartmentsPage,
});
