import { createFileRoute } from "@tanstack/react-router";

import { ManagerTendersPage } from "@/features/tenders/pages/ManagerTendersPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/tenders")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: ManagerTendersPage,
});
