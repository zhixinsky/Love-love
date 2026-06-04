import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('diary_media')
export class DiaryMediaEntity extends BaseEntity {
  @Column({ name: 'diary_id', type: 'bigint' })
  diaryId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'media_type', type: 'tinyint', default: 1 })
  mediaType: number;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
