import type { ResourceDto } from "@frms/shared";

import { apiGet } from "@/lib/api-client";

export const resourcesApi = {
  list: () => apiGet<ResourceDto[]>("/api/resources"),
  available: () => apiGet<ResourceDto[]>("/api/resources/available"),
};
