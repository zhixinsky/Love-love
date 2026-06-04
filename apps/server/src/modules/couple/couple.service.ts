import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { UserEntity } from '../../entities/user.entity';
import {
  findActiveCouple,
  getPartnerId,
} from '../../common/helpers/couple.helper';

@Injectable()
export class CoupleService {
  constructor(
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async invite(userId: string, loveStartDate?: string) {
    const existing = await findActiveCouple(this.coupleRepo, userId);
    if (existing) throw new BadRequestException('已有绑定关系');

    const pending = await this.coupleRepo.findOne({
      where: { userId, status: 0 },
      order: { createdAt: 'DESC' },
    });
    if (pending?.inviteCode) {
      return {
        inviteCode: pending.inviteCode,
        expireTime: new Date(Date.now() + 86400000).toISOString(),
      };
    }

    const inviteCode = `LOVE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const row = this.coupleRepo.create({
      userId,
      inviteCode,
      loveStartDate: loveStartDate ?? undefined,
      status: 0,
    });
    await this.coupleRepo.save(row);
    return {
      inviteCode,
      expireTime: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  async bind(userId: string, inviteCode: string) {
    const pending = await this.coupleRepo.findOne({
      where: { inviteCode, status: 0 },
    });
    if (!pending) throw new NotFoundException('邀请码无效或已过期');
    if (pending.userId === userId)
      throw new BadRequestException('不能绑定自己');

    const myActive = await findActiveCouple(this.coupleRepo, userId);
    if (myActive) throw new BadRequestException('您已绑定情侣');

    const partnerActive = await findActiveCouple(
      this.coupleRepo,
      pending.userId,
    );
    if (partnerActive) throw new BadRequestException('对方已绑定他人');

    pending.partnerId = userId;
    pending.status = 1;
    pending.bindTime = new Date();
    await this.coupleRepo.save(pending);

    await this.userRepo.update(userId, { loveStatus: 1 });
    await this.userRepo.update(pending.userId, { loveStatus: 1 });

    const partner = await this.userRepo.findOne({
      where: { id: pending.userId },
    });
    return {
      coupleId: pending.id,
      partner: {
        id: partner?.id,
        nickname: partner?.nickname,
        avatar: partner?.avatar,
      },
      loveStartDate: pending.loveStartDate,
    };
  }

  async info(userId: string) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) return { bound: false };
    const pid = getPartnerId(couple, userId);
    const partner = pid
      ? await this.userRepo.findOne({ where: { id: pid } })
      : null;
    const loveDays = couple.loveStartDate
      ? Math.max(
          1,
          Math.floor(
            (Date.now() - new Date(couple.loveStartDate).getTime()) /
              86400000,
          ) + 1,
        )
      : 0;
    return {
      bound: true,
      coupleId: couple.id,
      loveStartDate: couple.loveStartDate,
      loveDays,
      partner: partner
        ? { id: partner.id, nickname: partner.nickname, avatar: partner.avatar }
        : null,
    };
  }

  async unbind(userId: string) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    if (!couple) throw new NotFoundException('未绑定情侣');
    couple.status = 2;
    couple.unbindTime = new Date();
    await this.coupleRepo.save(couple);
    const ids = [couple.userId, couple.partnerId].filter(Boolean) as string[];
    for (const id of ids) {
      await this.userRepo.update(id, { loveStatus: 0 });
    }
    return { success: true };
  }
}
