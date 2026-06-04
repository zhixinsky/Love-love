import { http } from '@/utils/request';

export function submitReport(data: Record<string, unknown>) {
  return http.post<{ success: boolean }>('/report', data);
}
