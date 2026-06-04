import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/utils/storage';

export interface UserProfile {
  id: number | string;
  mobile?: string;
  nickname: string;
  avatar: string;
  gender?: number;
  birthday?: string;
  city?: string;
  bio?: string;
  loveStatus?: number;
}

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const profile = ref<UserProfile | null>(null);

  function hydrateFromStorage() {
    token.value = getToken();
    profile.value = getStoredUser<UserProfile>();
  }

  function setSession(newToken: string, user: UserProfile) {
    token.value = newToken;
    profile.value = user;
    setToken(newToken);
    setStoredUser(user);
  }

  function logout() {
    token.value = '';
    profile.value = null;
    clearAuthStorage();
    uni.reLaunch({ url: '/pages/login/index' });
  }

  const isLoggedIn = () => !!token.value;

  return { token, profile, hydrateFromStorage, setSession, logout, isLoggedIn };
});
