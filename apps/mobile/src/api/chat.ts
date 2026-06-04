import { http } from '@/utils/request';

export function getSessionList() {
  return http.get<{ list: unknown[] }>('/chat/session/list');
}

export function createChatSession(targetUserId: number | string) {
  return http.post<{
    sessionId: string | number;
    targetUserId: string;
    nickname?: string;
    avatar?: string;
  }>('/chat/session', { targetUserId: Number(targetUserId) });
}

export function getMessageList(sessionId: number, params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/chat/message/list', {
    sessionId,
    ...params,
  });
}

export function sendMessage(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/chat/message', data);
}
