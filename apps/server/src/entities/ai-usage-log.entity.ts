import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_usage_log')
export class AiUsageLogEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ length: 50 })
  scene: string;

  @Column({ length: 50, nullable: true })
  model: string;

  @Column({ name: 'prompt_tokens', type: 'int', default: 0 })
  promptTokens: number;

  @Column({ name: 'completion_tokens', type: 'int', default: 0 })
  completionTokens: number;

  @Column({ name: 'total_tokens', type: 'int', default: 0 })
  totalTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost: string;
}
