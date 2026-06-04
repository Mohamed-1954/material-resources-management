import { createFileRoute } from "@tanstack/react-router";

import { SubmitOfferPage } from "@/features/offers/pages/SubmitOfferPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/supplier/tenders/$tenderId/submit-offer")({
  beforeLoad: requireRole("SUPPLIER"),
  component: RouteComponent,
});

function RouteComponent() {
  const { tenderId } = Route.useParams();
  return <SubmitOfferPage tenderId={tenderId} />;
}
