import type { NotificationDto } from "@frms/shared";

import { apiGet, apiPatch } from "@/lib/api-client";

export const notificationsApi = {
  list: () => apiGet<NotificationDto[]>("/api/notifications"),
  unread: () => apiGet<NotificationDto[]>("/api/notifications/unread"),
  markRead: (id: string) => apiPatch<NotificationDto>(`/api/notifications/${id}/read`),
  markAllRead: () => apiPatch<void>("/api/notifications/read-all"),
};
