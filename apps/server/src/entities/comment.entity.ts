import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('comment')
export class CommentEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'target_type', type: 'tinyint' })
  targetType: number;

  @Column({ name: 'target_id', type: 'bigint' })
  targetId: string;

  @Column({ name: 'parent_id', type: 'bigint', default: '0' })
  parentId: string;

  @Column({ name: 'reply_user_id', type: 'bigint', default: '0' })
  replyUserId: string;

  @Column({ length: 500 })
  content: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
