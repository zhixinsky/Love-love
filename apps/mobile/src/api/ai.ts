import { http } from '@/utils/request';

export function createAiSession() {
  return http.post<{ sessionId: number }>('/ai/session');
}

export function aiChat(data: {
  sessionId: number;
  content: string;
  useDiaryMemory?: boolean;
}) {
  return http.post<{ reply: string; usedMemories?: string[] }>('/ai/chat', data);
}

export function getAiMemoryList() {
  return http.get<{ list: unknown[] }>('/ai/memory/list');
}

export function deleteAiMemory(id: number | string) {
  return http.del<{ success: boolean }>(`/ai/memory/${id}`);
}

export function generateAiReport(data?: Record<string, unknown>) {
  return http.post<{ reportId: number }>('/ai/report/generate', data);
}

export function getAiReport(id: number | string) {
  return http.get<Record<string, unknown>>(`/ai/report/${id}`);
}
