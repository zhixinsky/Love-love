import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('anniversary')
export class AnniversaryEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint' })
  coupleId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: string;

  @Column({ name: 'repeat_type', type: 'tinyint', default: 0 })
  repeatType: number;

  @Column({ name: 'reminder_days', type: 'int', default: 3 })
  reminderDays: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
