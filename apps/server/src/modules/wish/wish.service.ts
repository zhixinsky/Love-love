import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { WishEntity } from '../../entities/wish.entity';
import { findActiveCouple } from '../../common/helpers/couple.helper';
import { CreateWishDto } from './dto/create-wish.dto';

@Injectable()
export class WishService {
  constructor(
    @InjectRepository(WishEntity)
    private readonly repo: Repository<WishEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
  ) {}

  async create(userId: string, dto: CreateWishDto) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) throw new ForbiddenException('请先绑定情侣');
    const row = this.repo.create({
      userId,
      coupleId: couple.id,
      title: dto.title,
      description: dto.description,
      status: 1,
    });
    await this.repo.save(row);
    return { id: row.id };
  }

  async list(userId: string) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) return { list: [] };
    const list = await this.repo.find({
      where: { coupleId: couple.id, status: In([1, 2]) },
      order: { createdAt: 'DESC' },
    });
    return {
      list: list.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        completed: w.status === 2,
      })),
    };
  }

  async complete(userId: string, id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('愿望不存在');
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple || row.coupleId !== couple.id)
      throw new ForbiddenException('无权操作');
    row.status = 2;
    row.completeTime = new Date();
    await this.repo.save(row);
    return { success: true };
  }
}
