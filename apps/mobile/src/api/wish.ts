import { http } from '@/utils/request';

export function createWish(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/wish', data);
}

export function getWishList() {
  return http.get<{ list: unknown[] }>('/wish/list');
}

export function completeWish(id: number | string) {
  return http.post<{ success: boolean }>(`/wish/${id}/complete`);
}
