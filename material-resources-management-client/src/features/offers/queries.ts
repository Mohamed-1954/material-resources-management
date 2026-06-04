import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { offersApi } from "./api";

export const offerQueryKeys = {
  all: ["offers"] as const,
  lists: () => [...offerQueryKeys.all, "list"] as const,
  byTender: (tenderId: string) => [...offerQueryKeys.all, "by-tender", tenderId] as const,
  detail: (id: string) => [...offerQueryKeys.all, "detail", id] as const,
};

export function useOffersQuery() {
  return useQuery({
    queryKey: offerQueryKeys.lists(),
    queryFn: offersApi.list,
    staleTime: STALE.standard,
  });
}

export function useOffersByTenderQuery(tenderId: string | undefined) {
  return useQuery({
    enabled: Boolean(tenderId),
    queryKey: offerQueryKeys.byTender(tenderId ?? ""),
    queryFn: offersApi.list,
    select: (rows) => rows.filter((o) => o.tenderId === tenderId),
    staleTime: STALE.standard,
  });
}
