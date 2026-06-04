import type { OfferCreateInput, SupplierOfferDto } from "@frms/shared";

import { apiGet, apiPost } from "@/lib/api-client";

export const offersApi = {
  list: () => apiGet<SupplierOfferDto[]>("/api/offers"),
  detail: (id: string) => apiGet<SupplierOfferDto>(`/api/offers/${id}`),
  createForTender: (tenderId: string, body: OfferCreateInput) =>
    apiPost<SupplierOfferDto>(`/api/offers/by-tender/${tenderId}`, body),
  submit: (id: string) => apiPost<SupplierOfferDto>(`/api/offers/${id}/submit`),
  withdraw: (id: string) => apiPost<SupplierOfferDto>(`/api/offers/${id}/withdraw`),
  eliminate: (id: string, reason: string) =>
    apiPost<SupplierOfferDto>(`/api/offers/${id}/eliminate`, { reason }),
  accept: (id: string) => apiPost<SupplierOfferDto>(`/api/offers/${id}/accept`),
  reject: (id: string, reason: string) =>
    apiPost<SupplierOfferDto>(`/api/offers/${id}/reject`, { reason }),
};
