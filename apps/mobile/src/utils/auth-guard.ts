import { getToken } from './storage';

const PUBLIC_PAGES = [
  '/pages/splash/index',
  '/pages/login/index',
];

export function isPublicPage(path: string): boolean {
  return PUBLIC_PAGES.some((p) => path.includes(p));
}

export function ensureLoggedIn(): boolean {
  const token = getToken();
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' });
    return false;
  }
  return true;
}
