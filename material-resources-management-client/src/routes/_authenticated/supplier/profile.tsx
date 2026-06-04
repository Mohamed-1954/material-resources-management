import { createFileRoute } from "@tanstack/react-router";

import { SupplierProfilePage } from "@/features/suppliers/pages/SupplierProfilePage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/supplier/profile")({
  beforeLoad: requireRole("SUPPLIER"),
  component: SupplierProfilePage,
});
