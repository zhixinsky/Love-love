import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('like_record')
@Index('uk_user_target', ['userId', 'targetType', 'targetId'], { unique: true })
export class LikeRecordEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'target_type', type: 'tinyint' })
  targetType: number;

  @Column({ name: 'target_id', type: 'bigint' })
  targetId: string;
}
