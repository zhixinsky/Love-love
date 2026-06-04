import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('chat_session')
export class ChatSessionEntity extends BaseEntity {
  @Column({ name: 'session_type', type: 'tinyint', default: 1 })
  sessionType: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'target_user_id', type: 'bigint', nullable: true })
  targetUserId: string;

  @Column({ name: 'ai_role_id', type: 'bigint', nullable: true })
  aiRoleId: string;

  @Column({ name: 'last_message', length: 255, nullable: true })
  lastMessage: string;

  @Column({ name: 'last_message_time', type: 'datetime', nullable: true })
  lastMessageTime: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
