import { getToken, clearAuthStorage } from './storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: Record<string, unknown>;
  auth?: boolean;
}

const AUTH_WHITELIST = [
  '/auth/login/mobile',
  '/auth/login/wechat',
  '/auth/sms/send',
];

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true } = options;
  const token = getToken();
  const needAuth = auth && !AUTH_WHITELIST.some((p) => url.includes(p));

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(needAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        const body = res.data as ApiResponse<T>;
        if (res.statusCode === 401 || body?.code === 401) {
          clearAuthStorage();
          uni.reLaunch({ url: '/pages/login/index' });
          reject(new Error(body?.message || '未登录'));
          return;
        }
        if (body?.code !== 0) {
          reject(new Error(body?.message || '请求失败'));
          return;
        }
        resolve(body.data);
      },
      fail: (err) => reject(err),
    });
  });
}

export const http = {
  get: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'GET', data }),
  post: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'PUT', data }),
  del: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'DELETE', data }),
};
