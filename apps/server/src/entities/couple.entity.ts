import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('couple')
export class CoupleEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'partner_id', type: 'bigint', nullable: true })
  partnerId: string;

  @Column({ name: 'invite_code', length: 20, nullable: true })
  inviteCode: string;

  @Column({ name: 'love_start_date', type: 'date', nullable: true })
  loveStartDate: string | null;

  @Column({ name: 'bind_time', type: 'datetime', nullable: true })
  bindTime: Date;

  @Column({ name: 'unbind_time', type: 'datetime', nullable: true })
  unbindTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  status: number;
}
