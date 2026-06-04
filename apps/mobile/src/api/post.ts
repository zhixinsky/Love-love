import { http } from '@/utils/request';

export function createPost(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/post', data);
}

export function getPostList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/post/list', params);
}

export function getPostDetail(id: number | string) {
  return http.get<Record<string, unknown>>(`/post/${id}`);
}

export function deletePost(id: number | string) {
  return http.del<{ success: boolean }>(`/post/${id}`);
}
