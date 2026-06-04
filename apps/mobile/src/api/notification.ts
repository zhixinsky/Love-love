import { http } from '@/utils/request';

export function getNotificationList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[]; unreadCount?: number }>(
    '/notification/list',
    params,
  );
}

export function markNotificationRead(ids: number[]) {
  return http.post<{ success: boolean }>('/notification/read', { ids });
}
