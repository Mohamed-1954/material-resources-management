import type { AuditLogDto } from "@frms/shared";

import { apiGet } from "@/lib/api-client";

export const auditApi = {
  list: () => apiGet<AuditLogDto[]>("/api/audit-logs"),
  byEntity: (entityType: string, entityId: string) =>
    apiGet<AuditLogDto[]>(`/api/audit-logs/by-entity/${entityType}/${entityId}`),
};
