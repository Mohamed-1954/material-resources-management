import { createFileRoute } from "@tanstack/react-router";

import { SupplierOffersPage } from "@/features/offers/pages/SupplierOffersPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/supplier/offers")({
  beforeLoad: requireRole("SUPPLIER"),
  component: SupplierOffersPage,
});
