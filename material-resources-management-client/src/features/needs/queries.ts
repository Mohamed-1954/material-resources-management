import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { needsApi } from "./api";

export const needQueryKeys = {
  all: ["needs"] as const,
  lists: () => [...needQueryKeys.all, "list"] as const,
  detail: (id: string) => [...needQueryKeys.all, "detail", id] as const,
};

export function useNeedsQuery() {
  return useQuery({
    queryKey: needQueryKeys.lists(),
    queryFn: needsApi.list,
    staleTime: STALE.standard,
  });
}
