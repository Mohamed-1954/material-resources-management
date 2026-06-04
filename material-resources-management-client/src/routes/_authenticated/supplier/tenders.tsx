import { createFileRoute } from "@tanstack/react-router";

import { SupplierTendersPage } from "@/features/tenders/pages/SupplierTendersPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/supplier/tenders")({
  beforeLoad: requireRole("SUPPLIER"),
  component: SupplierTendersPage,
});
