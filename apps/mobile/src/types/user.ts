export interface PublicUserStats {
  postCount: number;
  diaryCount: number;
  fansCount: number;
}

export interface PublicUserProfile {
  id: string | number;
  nickname: string;
  avatar: string;
  bio?: string;
  city?: string;
  isFollowed?: boolean;
  canMessage?: boolean;
  stats: PublicUserStats;
}

export interface UserHomeData {
  user: {
    id: number | string;
    nickname: string;
    avatar: string;
    loveStatus: number;
  };
  couple: {
    coupleId: number | string;
    loveDays: number;
    partnerNickname: string;
    partnerAvatar?: string;
  } | null;
  stats: {
    diaryCount: number;
    postCount: number;
    followCount: number;
    fansCount: number;
  };
}
