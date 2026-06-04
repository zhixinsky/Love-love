import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('report')
export class ReportEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'target_type', type: 'tinyint' })
  targetType: number;

  @Column({ name: 'target_id', type: 'bigint' })
  targetId: string;

  @Column({ name: 'reason_type', type: 'tinyint' })
  reasonType: number;

  @Column({ length: 500, nullable: true })
  reason: string;

  @Column({ type: 'tinyint', default: 0 })
  status: number;
}
