import { getToken } from './storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function uploadVoiceFile(filePath: string): Promise<string> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/upload/voice`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const body = JSON.parse(res.data) as {
            code: number;
            data?: { url?: string; fileUrl?: string };
            message?: string;
          };
          if (body.code === 0 && body.data) {
            resolve(body.data.url || body.data.fileUrl || '');
            return;
          }
          reject(new Error(body.message || '上传失败'));
        } catch {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

export function uploadImageFile(filePath: string): Promise<string> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/upload/image`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        try {
          const body = JSON.parse(res.data) as {
            code: number;
            data?: { url?: string; fileUrl?: string };
            message?: string;
          };
          if (body.code === 0 && body.data) {
            resolve(body.data.url || body.data.fileUrl || '');
            return;
          }
          reject(new Error(body.message || '上传失败'));
        } catch {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}
