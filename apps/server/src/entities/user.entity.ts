import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ length: 20, nullable: true })
  mobile: string;

  @Column({ length: 100, nullable: true })
  openid: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'tinyint', default: 0 })
  gender: number;

  @Column({ type: 'date', nullable: true })
  birthday: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 255, nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({
    name: 'location_updated_at',
    type: 'datetime',
    nullable: true,
  })
  locationUpdatedAt: Date;

  @Column({ name: 'love_status', type: 'tinyint', default: 0 })
  loveStatus: number;

  @Column({ name: 'is_verified', type: 'tinyint', default: 0 })
  isVerified: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  /** 1=在附近的人展示 */
  @Column({ name: 'show_nearby', type: 'tinyint', default: 1 })
  showNearby: number;

  /** 1=允许陌生人私信 */
  @Column({ name: 'allow_dm', type: 'tinyint', default: 1 })
  allowDm: number;
}
