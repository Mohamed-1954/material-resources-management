import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { auditApi } from "./api";

export const auditQueryKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditQueryKeys.all, "list"] as const,
  byEntity: (entityType: string, entityId: string) =>
    [...auditQueryKeys.all, "by-entity", entityType, entityId] as const,
};

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: auditQueryKeys.lists(),
    queryFn: auditApi.list,
    staleTime: STALE.reference,
  });
}
