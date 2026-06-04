import { http } from '@/utils/request';

export function createAnniversary(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/anniversary', data);
}

export function getAnniversaryList() {
  return http.get<{ list: unknown[] }>('/anniversary/list');
}

export function deleteAnniversary(id: number | string) {
  return http.del<{ success: boolean }>(`/anniversary/${id}`);
}
