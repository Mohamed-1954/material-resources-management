import type { ResourceAssignmentDto } from "@frms/shared";

import { apiGet } from "@/lib/api-client";

export interface MyAssignments {
  personal: ResourceAssignmentDto[];
  department: ResourceAssignmentDto[];
}

export const assignmentsApi = {
  my: () => apiGet<MyAssignments>("/api/assignments/my"),
  byDepartment: (departmentId: string) =>
    apiGet<ResourceAssignmentDto[]>(`/api/assignments/by-department/${departmentId}`),
  byUser: (userId: string) =>
    apiGet<ResourceAssignmentDto[]>(`/api/assignments/by-user/${userId}`),
  byResource: (resourceId: string) =>
    apiGet<ResourceAssignmentDto[]>(`/api/assignments/by-resource/${resourceId}`),
};
