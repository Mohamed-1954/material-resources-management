import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { suppliersApi } from "./api";

export const supplierQueryKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierQueryKeys.all, "list"] as const,
  me: () => [...supplierQueryKeys.all, "me"] as const,
};

export function useSuppliersQuery() {
  return useQuery({
    queryKey: supplierQueryKeys.lists(),
    queryFn: suppliersApi.list,
    staleTime: STALE.calm,
  });
}

export function useMyCompanyQuery() {
  return useQuery({
    queryKey: supplierQueryKeys.me(),
    queryFn: suppliersApi.me,
    staleTime: STALE.calm,
  });
}
