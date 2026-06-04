import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('vip_user')
export class VipUserEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'vip_type', type: 'tinyint', default: 1 })
  vipType: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
