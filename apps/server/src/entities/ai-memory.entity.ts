import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_memory')
export class AiMemoryEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint', nullable: true })
  coupleId: string;

  @Column({ name: 'memory_type', type: 'tinyint', default: 2 })
  memoryType: number;

  @Column({ name: 'source_type', type: 'tinyint', default: 2 })
  sourceType: number;

  @Column({ name: 'source_id', type: 'bigint', nullable: true })
  sourceId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 50 })
  importance: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
