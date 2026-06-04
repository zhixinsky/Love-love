import { http } from '@/utils/request';
import type { UserProfile } from '@/store/user';
import type { PublicUserProfile, UserHomeData } from '@/types/user';

export function getProfile() {
  return http.get<UserProfile>('/user/profile');
}

export function updateProfile(data: Partial<UserProfile>) {
  return http.put<{ success: boolean }>('/user/profile', data);
}

export function getPrivacy() {
  return http.get<{ showNearby: number; allowDm: number }>('/user/privacy');
}

export function updatePrivacy(data: {
  showNearby?: number;
  allowDm?: number;
}) {
  return http.put<{ success: boolean; showNearby: number; allowDm: number }>(
    '/user/privacy',
    data,
  );
}

export function getSoulMatchList(limit = 10) {
  return http.get<{ list: SoulMatchUser[] }>('/user/soul-match', { limit });
}

export function getPublicUserPosts(
  userId: string | number,
  params?: { page?: number; pageSize?: number },
) {
  return http.get<{ list: unknown[]; total: number }>(
    `/user/public/${userId}/posts`,
    params,
  );
}

export interface SoulMatchUser {
  id: string | number;
  nickname: string;
  avatar: string;
  city: string;
  bio: string;
  matchScore: number;
  matchPercent: number;
  reasons: string[];
}

export function getUserHome() {
  return http.get<UserHomeData>('/user/home');
}

export function blockUser(userId: number) {
  return http.post<{ success: boolean }>('/user/block', { userId });
}

export function getPublicUser(id: number | string) {
  return http.get<PublicUserProfile>(`/user/public/${id}`);
}

export function toggleFollow(userId: number) {
  return http.post<{ followed: boolean }>('/user/follow', { userId });
}

export function getFollowingList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/user/following', params);
}

export function getFollowersList(params?: Record<string, unknown>) {
  return http.get<{ list: unknown[] }>('/user/followers', params);
}

export function updateUserLocation(latitude: number, longitude: number) {
  return http.post<{ success: boolean }>('/user/location', {
    latitude,
    longitude,
  });
}

export function getNearbyUsers() {
  return http.get<{ list: unknown[]; needLocation?: boolean }>('/user/nearby');
}

export function getBlockList() {
  return http.get<{ list: unknown[] }>('/user/block/list');
}

export function unblockUser(userId: number | string) {
  return http.del<{ success: boolean }>(`/user/block/${userId}`);
}
