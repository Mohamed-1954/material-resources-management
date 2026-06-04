import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { tendersApi } from "./api";

export const tenderQueryKeys = {
  all: ["tenders"] as const,
  lists: () => [...tenderQueryKeys.all, "list"] as const,
  active: () => [...tenderQueryKeys.all, "active"] as const,
  detail: (id: string) => [...tenderQueryKeys.all, "detail", id] as const,
};

export function useTendersQuery() {
  return useQuery({
    queryKey: tenderQueryKeys.lists(),
    queryFn: tendersApi.list,
    staleTime: STALE.standard,
  });
}

export function useActiveTendersQuery() {
  return useQuery({
    queryKey: tenderQueryKeys.active(),
    queryFn: tendersApi.active,
    staleTime: STALE.volatile,
  });
}

export function useTenderQuery(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: tenderQueryKeys.detail(id ?? ""),
    queryFn: () => tendersApi.detail(id!),
    staleTime: STALE.standard,
  });
}
