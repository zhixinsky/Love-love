import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('follow')
@Index('uk_follow', ['userId', 'targetUserId'], { unique: true })
export class FollowEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'target_user_id', type: 'bigint' })
  targetUserId: string;
}
