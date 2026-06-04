import http from './http';

export function adminLogin(username: string, password: string) {
  return http.post<{ token: string }>('/admin/login', { username, password });
}

export function getAuditList() {
  return http.get('/admin/audit/list');
}

export function handleAudit(data: Record<string, unknown>) {
  return http.post('/admin/audit/handle', data);
}

export function getUserList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[]; total: number }>('/admin/user/list', params);
}

export function getReportList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[]; total: number }>('/admin/report/list', params);
}

export function getAiStats() {
  return http.get<Record<string, number>>('/admin/ai/stats');
}

export function setUserStatus(userId: string | number, status: number) {
  return http.post(`/admin/user/${userId}/status`, { status });
}
