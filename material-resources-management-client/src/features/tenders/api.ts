import type { TenderCreateInput, TenderDto } from "@frms/shared";

import { apiGet, apiPost } from "@/lib/api-client";

export type TenderTransition = "publish" | "close" | "start-evaluation" | "cancel";

export const tendersApi = {
  list: () => apiGet<TenderDto[]>("/api/tenders"),
  active: () => apiGet<TenderDto[]>("/api/tenders/active"),
  detail: (id: string) => apiGet<TenderDto>(`/api/tenders/${id}`),
  create: (body: TenderCreateInput) => apiPost<TenderDto>("/api/tenders", body),
  transition: (id: string, action: TenderTransition) =>
    apiPost<TenderDto>(`/api/tenders/${id}/${action}`),
};
