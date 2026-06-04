import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('diary')
export class DiaryEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint', nullable: true })
  coupleId: string | null;

  @Column({ length: 100, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 30, nullable: true })
  mood: string;

  @Column({ length: 30, nullable: true })
  weather: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'tinyint', default: 1 })
  visibility: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
