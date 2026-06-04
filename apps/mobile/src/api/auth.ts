import { http } from '@/utils/request';
import type { UserProfile } from '@/store/user';

export interface LoginResult {
  token: string;
  isNewUser?: boolean;
  user: UserProfile & { mobile?: string };
}

export function sendSmsCode(mobile: string) {
  return http.post<{ success: boolean; message?: string }>('/auth/sms/send', {
    mobile,
  });
}

export function loginByMobile(mobile: string, code: string) {
  return http.post<LoginResult>('/auth/login/mobile', { mobile, code });
}

export function loginByWechat(code: string, nickname?: string, avatar?: string) {
  return http.post<LoginResult>('/auth/login/wechat', { code, nickname, avatar });
}
