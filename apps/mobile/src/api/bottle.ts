import { http } from '@/utils/request';
import type { BottleListItem } from '@/types/bottle';

export function throwBottle(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/bottle', data);
}

export function pickBottle(city?: string) {
  const q = city ? `?city=${encodeURIComponent(city)}` : '';
  return http.post<Record<string, unknown>>(`/bottle/pick${q}`);
}

export function getBottleDetail(id: string | number) {
  return http.get<Record<string, unknown>>(`/bottle/${id}`);
}

export function getMyBottles() {
  return http.get<{ list: BottleListItem[] }>('/bottle/my/list');
}

export function replyBottle(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/bottle/reply', data);
}
