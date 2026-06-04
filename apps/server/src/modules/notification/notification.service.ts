import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationEntity } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
  ) {}

  async create(data: {
    userId: string;
    type: number;
    title: string;
    content: string;
    relatedType?: number;
    relatedId?: string;
  }) {
    await this.notifRepo.save(this.notifRepo.create({ ...data, isRead: 0 }));
  }

  async list(userId: string, page = 1, pageSize = 20, type?: number) {
    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    const [list, total] = await this.notifRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const unreadCount = await this.notifRepo.count({
      where: { userId, isRead: 0, ...(type ? { type } : {}) },
    });
    return { list, total, unreadCount };
  }

  async markRead(userId: string, ids: number[]) {
    await this.notifRepo.update(
      { userId, id: In(ids.map((id) => String(id))) },
      { isRead: 1 },
    );
    return { success: true };
  }
}
