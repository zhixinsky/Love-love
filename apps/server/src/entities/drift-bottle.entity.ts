import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('drift_bottle')
export class DriftBottleEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'media_url', length: 500, nullable: true })
  mediaUrl: string;

  @Column({ name: 'bottle_type', type: 'tinyint', default: 1 })
  bottleType: number;

  @Column({ name: 'is_anonymous', type: 'tinyint', default: 1 })
  isAnonymous: number;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'picked_user_id', type: 'bigint', nullable: true })
  pickedUserId: string;

  @Column({ name: 'picked_time', type: 'datetime', nullable: true })
  pickedTime: Date;
}
