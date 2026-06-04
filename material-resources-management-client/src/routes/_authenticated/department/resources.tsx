import { createFileRoute } from "@tanstack/react-router";

import { DepartmentResourcesPage } from "@/features/assignments/pages/DepartmentResourcesPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/department/resources")({
  beforeLoad: requireRole("DEPARTMENT_HEAD"),
  component: DepartmentResourcesPage,
});
