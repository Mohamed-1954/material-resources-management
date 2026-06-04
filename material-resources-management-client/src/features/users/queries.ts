import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { usersApi } from "./api";

export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  me: () => [...userQueryKeys.all, "me"] as const,
};

export function useUsersQuery() {
  return useQuery({
    queryKey: userQueryKeys.lists(),
    queryFn: usersApi.list,
    staleTime: STALE.calm,
  });
}

export function useMeQuery() {
  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: usersApi.me,
    staleTime: STALE.calm,
  });
}
