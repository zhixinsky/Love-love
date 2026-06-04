const TOKEN_KEY = 'love_token';
const USER_KEY = 'love_user';

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token);
}

export function removeToken(): void {
  uni.removeStorageSync(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  const raw = uni.getStorageSync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  uni.setStorageSync(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage(): void {
  removeToken();
  uni.removeStorageSync(USER_KEY);
}
