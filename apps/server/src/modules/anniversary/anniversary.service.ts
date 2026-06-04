import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnniversaryEntity } from '../../entities/anniversary.entity';
import { CoupleEntity } from '../../entities/couple.entity';
import { findActiveCouple } from '../../common/helpers/couple.helper';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';

@Injectable()
export class AnniversaryService {
  constructor(
    @InjectRepository(AnniversaryEntity)
    private readonly repo: Repository<AnniversaryEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
  ) {}

  async create(userId: string, dto: CreateAnniversaryDto) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) throw new ForbiddenException('请先绑定情侣');
    const row = this.repo.create({
      userId,
      coupleId: couple.id,
      title: dto.title,
      eventDate: dto.eventDate,
      repeatType: dto.repeatType ?? 0,
      reminderDays: dto.reminderDays ?? 3,
      status: 1,
    });
    await this.repo.save(row);
    return { id: row.id };
  }

  async list(userId: string) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) return { list: [] };
    const list = await this.repo.find({
      where: { coupleId: couple.id, status: 1 },
      order: { eventDate: 'ASC' },
    });
    return {
      list: list.map((a) => ({
        id: a.id,
        title: a.title,
        eventDate: a.eventDate,
        daysLeft: this.daysUntil(a.eventDate),
        repeatType: a.repeatType,
      })),
    };
  }

  async remove(userId: string, id: string) {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('纪念日不存在');
    row.status = 2;
    await this.repo.save(row);
    return { success: true };
  }

  private daysUntil(dateStr: string) {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / 86400000);
  }
}
