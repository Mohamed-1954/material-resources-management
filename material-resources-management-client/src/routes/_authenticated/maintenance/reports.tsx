import { createFileRoute } from "@tanstack/react-router";

import { TechReportsPage } from "@/features/maintenance/pages/TechReportsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/maintenance/reports")({
  beforeLoad: requireRole("MAINTENANCE_TECHNICIAN"),
  component: TechReportsPage,
});
