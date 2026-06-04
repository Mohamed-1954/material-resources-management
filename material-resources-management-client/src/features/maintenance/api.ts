import type {
  FailureCreateInput,
  FailureReportDto,
  TechnicalReportInput,
} from "@frms/shared";

import { apiGet, apiPost } from "@/lib/api-client";

export type FailureTransition =
  | "assign-technician"
  | "start-intervention"
  | "resolve"
  | "mark-severe"
  | "request-supplier-repair"
  | "request-replacement";

export const maintenanceApi = {
  list: () => apiGet<FailureReportDto[]>("/api/failures"),
  detail: (id: string) => apiGet<FailureReportDto>(`/api/failures/${id}`),
  create: (body: FailureCreateInput) => apiPost<FailureReportDto>("/api/failures", body),
  transition: (id: string, action: FailureTransition) =>
    apiPost<FailureReportDto>(`/api/failures/${id}/${action}`),
  technicalReport: (id: string, body: TechnicalReportInput) =>
    apiPost(`/api/failures/${id}/technical-report`, body),
};
