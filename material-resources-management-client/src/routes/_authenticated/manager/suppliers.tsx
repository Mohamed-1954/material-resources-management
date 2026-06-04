import { createFileRoute } from "@tanstack/react-router";

import { ManagerSuppliersPage } from "@/features/suppliers/pages/ManagerSuppliersPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/suppliers")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: ManagerSuppliersPage,
});
