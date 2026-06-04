import { createFileRoute } from "@tanstack/react-router";

import { ManagerResourcesPage } from "@/features/inventory/pages/ManagerResourcesPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/resources")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: ManagerResourcesPage,
});
