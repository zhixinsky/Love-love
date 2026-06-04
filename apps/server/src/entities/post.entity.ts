import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('post')
export class PostEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'topic_id', type: 'bigint', nullable: true })
  topicId: string | null;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ name: 'post_type', type: 'tinyint', default: 1 })
  postType: number;

  @Column({ name: 'source_id', type: 'bigint', nullable: true })
  sourceId: string | null;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'collect_count', type: 'int', default: 0 })
  collectCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
