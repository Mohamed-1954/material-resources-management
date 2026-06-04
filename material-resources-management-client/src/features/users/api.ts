import type { Role, UserDto } from "@frms/shared";

import { apiGet, apiPatch, apiPost } from "@/lib/api-client";

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  departmentId?: string | null;
  password: string;
}

export const usersApi = {
  list: () => apiGet<UserDto[]>("/api/users"),
  me: () => apiGet<UserDto>("/api/users/me"),
  create: (body: CreateUserInput) => apiPost<UserDto>("/api/users", body),
  setRole: (id: string, role: Role) =>
    apiPatch<UserDto>(`/api/users/${id}/role`, { role }),
  setStatus: (id: string, status: "ACTIVE" | "INACTIVE") =>
    apiPatch<UserDto>(`/api/users/${id}/status`, { status }),
};
