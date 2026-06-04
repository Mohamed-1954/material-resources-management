import { useQuery } from "@tanstack/react-query";

import type { FailureStatus } from "@frms/shared";

import { STALE } from "@/lib/query-stale";

import { maintenanceApi } from "./api";

export const failureQueryKeys = {
  all: ["failures"] as const,
  lists: () => [...failureQueryKeys.all, "list"] as const,
  byStatus: (status: FailureStatus) =>
    [...failureQueryKeys.all, "by-status", status] as const,
  detail: (id: string) => [...failureQueryKeys.all, "detail", id] as const,
};

export function useFailuresQuery() {
  return useQuery({
    queryKey: failureQueryKeys.lists(),
    queryFn: maintenanceApi.list,
    staleTime: STALE.live,
  });
}

export function useFailuresByStatusQuery(status: FailureStatus) {
  return useQuery({
    queryKey: failureQueryKeys.byStatus(status),
    queryFn: maintenanceApi.list,
    select: (rows) => rows.filter((r) => r.status === status),
    staleTime: STALE.live,
  });
}
