import { getToken } from '@/utils/storage';

/** Tab 页与需登录页：未登录则跳转登录 */
export function useAuthRedirect() {
  function checkLogin() {
    if (!getToken()) {
      uni.reLaunch({ url: '/pages/login/index' });
      return false;
    }
    return true;
  }
  return { checkLogin };
}
