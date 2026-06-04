import { http } from '@/utils/request';

export function getCollectList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/collect/list', params);
}
