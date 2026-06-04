import { createFileRoute } from "@tanstack/react-router";

import { DepartmentNeedsPage } from "@/features/needs/pages/DepartmentNeedsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/department/needs")({
  beforeLoad: requireRole("DEPARTMENT_HEAD"),
  component: DepartmentNeedsPage,
});
