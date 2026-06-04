import { http } from '@/utils/request';

export function createInvite() {
  return http.post<{ inviteCode: string; expireAt: string }>('/couple/invite');
}

export function bindCouple(inviteCode: string) {
  return http.post<Record<string, unknown>>('/couple/bind', { inviteCode });
}

export function getCoupleInfo() {
  return http.get<Record<string, unknown>>('/couple/info');
}

export function unbindCouple() {
  return http.post<{ success: boolean }>('/couple/unbind');
}
