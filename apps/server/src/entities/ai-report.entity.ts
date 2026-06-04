import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_report')
export class AiReportEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint', nullable: true })
  coupleId: string | null;

  @Column({ name: 'report_type', type: 'tinyint', default: 1 })
  reportType: number;

  @Column({ name: 'emotion_score', type: 'int', default: 0 })
  emotionScore: number;

  @Column({ name: 'intimacy_score', type: 'int', default: 0 })
  intimacyScore: number;

  @Column({ name: 'communication_score', type: 'int', default: 0 })
  communicationScore: number;

  @Column({ name: 'ritual_score', type: 'int', default: 0 })
  ritualScore: number;

  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  suggestion: string;

  @Column({ name: 'raw_json', type: 'json', nullable: true })
  rawJson: Record<string, unknown>;
}
