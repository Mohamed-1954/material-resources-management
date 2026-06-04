import { createFileRoute } from "@tanstack/react-router";

import { TechnicalReportPage } from "@/features/maintenance/pages/TechnicalReportPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute(
  "/_authenticated/maintenance/failures/$failureId/technical-report",
)({
  beforeLoad: requireRole("MAINTENANCE_TECHNICIAN"),
  component: RouteComponent,
});

function RouteComponent() {
  const { failureId } = Route.useParams();
  return <TechnicalReportPage failureId={failureId} />;
}
