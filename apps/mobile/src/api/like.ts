import { http } from '@/utils/request';

export interface LikeToggleResult {
  liked: boolean;
  likeCount: number;
  /** 与 likeCount 相同，兼容旧字段 */
  count: number;
}

export function toggleLike(targetType: number, targetId: number) {
  return http
    .post<{ liked: boolean; likeCount: number }>('/like/toggle', {
      targetType,
      targetId,
    })
    .then((res) => ({
      liked: res.liked,
      likeCount: res.likeCount,
      count: res.likeCount,
    }));
}

export function toggleCollect(targetType: number, targetId: number) {
  return http.post<{ collected: boolean; collectCount?: number }>(
    '/collect/toggle',
    {
      targetType,
      targetId,
    },
  );
}
