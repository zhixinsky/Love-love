import { http } from '@/utils/request';
import type { DiaryDetail } from '@/types/diary';

export function createDiary(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/diary', data);
}

export function getDiaryList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/diary/list', params);
}

export function getDiaryDetail(id: number | string) {
  return http.get<DiaryDetail>(`/diary/${id}`);
}

export function updateDiary(id: number | string, data: Record<string, unknown>) {
  return http.put<Record<string, unknown>>(`/diary/${id}`, data);
}

export function deleteDiary(id: number | string) {
  return http.del<{ success: boolean }>(`/diary/${id}`);
}
