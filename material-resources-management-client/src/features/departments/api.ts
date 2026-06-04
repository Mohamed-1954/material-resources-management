import type { DepartmentDto, UserDto } from "@frms/shared";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";

export interface CreateDepartmentInput {
  name: string;
  code: string;
}

export const departmentsApi = {
  list: () => apiGet<DepartmentDto[]>("/api/departments"),
  members: (departmentId: string) =>
    apiGet<UserDto[]>(`/api/departments/${departmentId}/members`),
  create: (body: CreateDepartmentInput) =>
    apiPost<DepartmentDto>("/api/departments", body),
  update: (id: string, body: Partial<CreateDepartmentInput>) =>
    apiPatch<DepartmentDto>(`/api/departments/${id}`, body),
  setHead: (id: string, userId: string | null) =>
    apiPatch<DepartmentDto>(`/api/departments/${id}/head`, { userId }),
  remove: (id: string) => apiDelete<void>(`/api/departments/${id}`),
};
