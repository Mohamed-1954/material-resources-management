import type { NeedCreateInput, NeedRequestDto } from "@frms/shared";

import { apiGet, apiPost } from "@/lib/api-client";

export type NeedTransition =
  | "submit"
  | "approve"
  | "reject"
  | "request-changes"
  | "send-to-resource-manager";

export const needsApi = {
  list: () => apiGet<NeedRequestDto[]>("/api/needs"),
  detail: (id: string) => apiGet<NeedRequestDto>(`/api/needs/${id}`),
  create: (body: NeedCreateInput) => apiPost<NeedRequestDto>("/api/needs", body),
  transition: (id: string, action: NeedTransition) =>
    apiPost<NeedRequestDto>(`/api/needs/${id}/${action}`),
};
