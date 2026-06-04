export interface DiaryDetail {
  id?: string | number;
  title?: string;
  content?: string;
  mood?: string;
  weather?: string;
  visibility?: number;
  createdAt?: string;
  mediaList?: { url: string }[];
}
