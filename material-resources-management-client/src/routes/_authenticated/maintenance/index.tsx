import { createFileRoute } from "@tanstack/react-router";

import { SectionLanding } from "@/components/layout/SectionLanding";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/maintenance/")({
  beforeLoad: requireRole("MAINTENANCE_TECHNICIAN"),
  component: () => <SectionLanding sectionId="maintenance" />,
});
