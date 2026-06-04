import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('chat_message')
export class ChatMessageEntity extends BaseEntity {
  @Column({ name: 'session_id', type: 'bigint' })
  sessionId: string;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: string;

  @Column({ name: 'receiver_id', type: 'bigint', nullable: true })
  receiverId: string;

  @Column({ name: 'message_type', type: 'tinyint', default: 1 })
  messageType: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'media_url', length: 500, nullable: true })
  mediaUrl: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;
}
