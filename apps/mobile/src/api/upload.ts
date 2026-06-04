import { http } from '@/utils/request';

export function getUploadToken(scene: string) {
  return http.post<Record<string, unknown>>('/upload/token', { scene });
}
