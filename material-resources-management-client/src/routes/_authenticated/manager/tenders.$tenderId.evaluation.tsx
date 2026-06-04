import { createFileRoute } from "@tanstack/react-router";

import { TenderEvaluationPage } from "@/features/offers/pages/TenderEvaluationPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/tenders/$tenderId/evaluation")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: RouteComponent,
});

function RouteComponent() {
  const { tenderId } = Route.useParams();
  return <TenderEvaluationPage tenderId={tenderId} />;
}
