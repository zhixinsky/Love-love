import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => {
    const body = res.data as { code?: number; message?: string; data?: unknown };
    if (body?.code !== 0) {
      return Promise.reject(new Error(body?.message || '请求失败'));
    }
    // 运行时返回业务 data；request<T>() 对外声明为 Promise<T>
    return body.data as never;
  },
  (err) => Promise.reject(err),
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  return client.request(config) as Promise<T>;
}

const http = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>({ method: 'GET', url, params });
  },
  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ method: 'POST', url, data });
  },
};

export default http;
