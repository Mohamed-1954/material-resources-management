import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { notificationsApi } from "./api";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  unread: () => [...notificationQueryKeys.all, "unread"] as const,
};

export function useUnreadNotificationsQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.unread(),
    queryFn: notificationsApi.unread,
    staleTime: STALE.live,
    refetchInterval: 30_000,
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}
