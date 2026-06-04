import { useQuery } from "@tanstack/react-query";

import { STALE } from "@/lib/query-stale";

import { assignmentsApi } from "./api";

export const assignmentQueryKeys = {
  all: ["assignments"] as const,
  my: () => [...assignmentQueryKeys.all, "my"] as const,
  byDepartment: (departmentId: string) =>
    [...assignmentQueryKeys.all, "by-department", departmentId] as const,
  byUser: (userId: string) =>
    [...assignmentQueryKeys.all, "by-user", userId] as const,
};

export function useMyAssignmentsQuery() {
  return useQuery({
    queryKey: assignmentQueryKeys.my(),
    queryFn: assignmentsApi.my,
    staleTime: STALE.calm,
  });
}

export function useAssignmentsByDepartmentQuery(departmentId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(departmentId),
    queryKey: assignmentQueryKeys.byDepartment(departmentId ?? ""),
    queryFn: () => assignmentsApi.byDepartment(departmentId!),
    staleTime: STALE.calm,
  });
}
