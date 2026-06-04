import { createFileRoute } from "@tanstack/react-router";

import { AuditLogsPage } from "@/features/audit/pages/AuditLogsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  beforeLoad: requireRole("ADMIN"),
  component: AuditLogsPage,
});
