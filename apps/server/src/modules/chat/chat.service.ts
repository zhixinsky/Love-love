import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from '../../entities/chat-message.entity';
import { ChatSessionEntity } from '../../entities/chat-session.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepo: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  /** 查找两人之间的私聊/漂流瓶会话（不含 AI） */
  async findDirectSession(userId: string, targetUserId: string) {
    return this.sessionRepo
      .createQueryBuilder('s')
      .where('s.status = 1')
      .andWhere('s.session_type != 3')
      .andWhere(
        '(s.user_id = :userId AND s.target_user_id = :targetId) OR (s.user_id = :targetId AND s.target_user_id = :userId)',
        { userId, targetId: targetUserId },
      )
      .getOne();
  }

  /**
   * 创建或获取与某用户的私聊会话
   * @param sessionType 1=漂流瓶 2=普通私聊
   */
  async createDirectSession(
    userId: string,
    targetUserId: string,
    sessionType = 2,
  ) {
    const targetId = String(targetUserId);
    if (userId === targetId) {
      throw new BadRequestException('不能与自己聊天');
    }
    const target = await this.userRepo.findOne({ where: { id: targetId } });
    if (!target || target.status !== 1) {
      throw new NotFoundException('用户不存在');
    }

    if (sessionType !== 1) {
      const allowed = await this.userService.canSendDirectMessage(
        userId,
        targetId,
      );
      if (!allowed) {
        throw new BadRequestException(
          '对方已关闭陌生人私信，需互相关注后才能聊天',
        );
      }
    }

    let session = await this.findDirectSession(userId, targetId);
    if (!session) {
      session = this.sessionRepo.create({
        sessionType,
        userId,
        targetUserId: targetId,
        lastMessage: '',
        lastMessageTime: new Date(),
        status: 1,
      });
      await this.sessionRepo.save(session);
    }

    return {
      sessionId: session.id,
      sessionType: session.sessionType,
      targetUserId: targetId,
      nickname: target.nickname,
      avatar: target.avatar,
    };
  }

  async sessionList(userId: string) {
    const sessions = await this.sessionRepo.find({
      where: [
        { userId, status: 1 },
        { targetUserId: userId, status: 1 },
      ],
      order: { lastMessageTime: 'DESC' },
    });
    const list = await Promise.all(
      sessions.map(async (s) => {
        const otherId = s.userId === userId ? s.targetUserId : s.userId;
        const other = otherId
          ? await this.userRepo.findOne({ where: { id: otherId } })
          : null;
        const unreadCount = await this.messageRepo.count({
          where: {
            sessionId: s.id,
            receiverId: userId,
            isRead: 0,
          },
        });
        return {
          sessionId: s.id,
          sessionType: s.sessionType,
          targetUserId: otherId,
          nickname: other?.nickname || 'AI恋人',
          avatar: other?.avatar || '',
          lastMessage: s.lastMessage,
          lastMessageTime: s.lastMessageTime,
          unreadCount,
        };
      }),
    );
    return { list };
  }

  async messageList(sessionId: string, userId: string, page = 1, pageSize = 30) {
    const session = await this.requireSession(sessionId, userId);
    const [list, total] = await this.messageRepo.findAndCount({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    await this.messageRepo.update(
      { sessionId: session.id, receiverId: userId, isRead: 0 },
      { isRead: 1 },
    );

    return {
      list: list.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        messageType: m.messageType,
        mediaUrl: m.mediaUrl,
        isMine: m.senderId === userId,
        createdAt: m.createdAt,
      })),
      total,
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const session = await this.requireSession(String(dto.sessionId), userId);
    const receiverId =
      session.userId === userId ? session.targetUserId : session.userId;
    if (
      receiverId &&
      receiverId !== '0' &&
      session.sessionType !== 3 &&
      session.sessionType !== 1
    ) {
      const allowed = await this.userService.canSendDirectMessage(
        userId,
        receiverId,
      );
      if (!allowed) {
        throw new BadRequestException(
          '对方已关闭陌生人私信，需互相关注后才能聊天',
        );
      }
    }
    const msg = this.messageRepo.create({
      sessionId: session.id,
      senderId: userId,
      receiverId: receiverId || '0',
      messageType: dto.messageType || 1,
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      isRead: 0,
    });
    await this.messageRepo.save(msg);
    const preview =
      dto.messageType === 2
        ? '[图片]'
        : dto.messageType === 3
          ? '[语音]'
          : dto.content;
    session.lastMessage = preview.slice(0, 200);
    session.lastMessageTime = new Date();
    await this.sessionRepo.save(session);
    return this.formatMessage(msg, userId);
  }

  formatMessage(m: ChatMessageEntity, viewerId: string) {
    return {
      id: m.id,
      sessionId: m.sessionId,
      senderId: m.senderId,
      content: m.content,
      messageType: m.messageType,
      mediaUrl: m.mediaUrl,
      isMine: m.senderId === viewerId,
      createdAt: m.createdAt,
    };
  }

  private async requireSession(sessionId: string, userId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('会话不存在');
    if (session.userId !== userId && session.targetUserId !== userId) {
      throw new NotFoundException('无权访问会话');
    }
    return session;
  }
}
