import { createFileRoute } from "@tanstack/react-router";

import { TechnicianFailuresPage } from "@/features/maintenance/pages/TechnicianFailuresPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/maintenance/failures")({
  beforeLoad: requireRole("MAINTENANCE_TECHNICIAN"),
  component: TechnicianFailuresPage,
});
