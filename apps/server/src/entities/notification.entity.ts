import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notification')
export class NotificationEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'tinyint' })
  type: number;

  @Column({ length: 100, nullable: true })
  title: string;

  @Column({ length: 500, nullable: true })
  content: string;

  @Column({ name: 'related_type', type: 'tinyint', nullable: true })
  relatedType: number;

  @Column({ name: 'related_id', type: 'bigint', nullable: true })
  relatedId: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;
}
