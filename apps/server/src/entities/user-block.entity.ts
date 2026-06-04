import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('user_block')
@Index('uk_block', ['userId', 'blockedUserId'], { unique: true })
export class UserBlockEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'blocked_user_id', type: 'bigint' })
  blockedUserId: string;
}
