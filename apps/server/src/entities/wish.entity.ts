import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('wish')
export class WishEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint' })
  coupleId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'complete_time', type: 'datetime', nullable: true })
  completeTime: Date;
}
