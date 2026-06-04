import type { SupplierDto, SupplierRegisterInput } from "@frms/shared";

import { apiGet, apiPatch, apiPost } from "@/lib/api-client";

export interface SupplierUpdateInput {
  companyName?: string;
  location?: string | null;
  address?: string | null;
  website?: string | null;
  managerName?: string | null;
}

export const suppliersApi = {
  list: () => apiGet<SupplierDto[]>("/api/suppliers"),
  me: () => apiGet<SupplierDto>("/api/suppliers/me"),
  update: (id: string, body: SupplierUpdateInput) =>
    apiPatch<SupplierDto>(`/api/suppliers/${id}`, body),
  blacklist: (id: string, reason: string) =>
    apiPost<SupplierDto>(`/api/suppliers/${id}/blacklist`, { reason }),
  removeFromBlacklist: (id: string) =>
    apiPost<SupplierDto>(`/api/suppliers/${id}/remove-from-blacklist`),
  register: (body: SupplierRegisterInput) =>
    apiPost<{ userId: string; supplierId: string }>("/api/auth-extras/register-supplier", body),
};
