import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_role')
export class AiRoleEntity extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
