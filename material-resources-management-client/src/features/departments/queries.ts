import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { departmentsApi } from "./api";

export const departmentQueryKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentQueryKeys.all, "list"] as const,
  members: (departmentId: string) =>
    [...departmentQueryKeys.all, "members", departmentId] as const,
};

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: departmentQueryKeys.lists(),
    queryFn: departmentsApi.list,
    staleTime: STALE.calm,
  });
}

export function useDepartmentMembersQuery(departmentId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(departmentId),
    queryKey: departmentQueryKeys.members(departmentId ?? ""),
    queryFn: () => departmentsApi.members(departmentId!),
    staleTime: STALE.calm,
  });
}
