import { http } from '@/utils/request';

export function createComment(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/comment', data);
}

export function getCommentList(params: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/comment/list', params);
}
