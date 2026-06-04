import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { resourcesApi } from "./api";

export const resourceQueryKeys = {
  all: ["resources"] as const,
  lists: () => [...resourceQueryKeys.all, "list"] as const,
  available: () => [...resourceQueryKeys.all, "available"] as const,
};

export function useResourcesQuery() {
  return useQuery({
    queryKey: resourceQueryKeys.lists(),
    queryFn: resourcesApi.list,
    staleTime: STALE.standard,
  });
}
