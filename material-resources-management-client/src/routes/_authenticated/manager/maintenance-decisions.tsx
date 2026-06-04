import { createFileRoute } from "@tanstack/react-router";

import { MaintenanceDecisionsPage } from "@/features/maintenance/pages/MaintenanceDecisionsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/maintenance-decisions")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: MaintenanceDecisionsPage,
});
