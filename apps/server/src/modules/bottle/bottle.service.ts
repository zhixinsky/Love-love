import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriftBottleEntity } from '../../entities/drift-bottle.entity';
import { UserEntity } from '../../entities/user.entity';
import { ChatService } from '../chat/chat.service';
import { ThrowBottleDto } from './dto/throw-bottle.dto';

@Injectable()
export class BottleService {
  constructor(
    @InjectRepository(DriftBottleEntity)
    private readonly bottleRepo: Repository<DriftBottleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly chatService: ChatService,
  ) {}

  async throwBottle(userId: string, dto: ThrowBottleDto) {
    const bottle = this.bottleRepo.create({
      userId,
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      bottleType: dto.bottleType || 1,
      isAnonymous: dto.isAnonymous ? 1 : 0,
      city: dto.city,
      status: 1,
    });
    await this.bottleRepo.save(bottle);
    return { bottleId: bottle.id };
  }

  async pick(userId: string, city?: string) {
    const qb = this.bottleRepo
      .createQueryBuilder('b')
      .where('b.status = 1')
      .andWhere('b.userId != :userId', { userId })
      .orderBy('RAND()')
      .take(1);
    if (city) qb.andWhere('b.city = :city', { city });
    const bottle = await qb.getOne();
    if (!bottle) throw new NotFoundException('暂时没有可捞的瓶子');
    bottle.status = 2;
    bottle.pickedUserId = userId;
    bottle.pickedTime = new Date();
    await this.bottleRepo.save(bottle);
    return this.toBottleView(bottle);
  }

  async getDetail(userId: string, bottleId: string) {
    const bottle = await this.bottleRepo.findOne({ where: { id: bottleId } });
    if (!bottle) throw new NotFoundException('瓶子不存在');
    const canView =
      bottle.userId === userId ||
      bottle.pickedUserId === userId ||
      bottle.status === 1;
    if (!canView) throw new NotFoundException('无权查看该瓶子');
    return this.toBottleView(bottle);
  }

  async myBottles(userId: string, limit = 30) {
    const bottles = await this.bottleRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const list = await Promise.all(
      bottles.map((b) => this.toBottleView(b)),
    );
    return { list };
  }

  async reply(userId: string, bottleId: string, content: string) {
    const bottle = await this.bottleRepo.findOne({ where: { id: bottleId } });
    if (!bottle) throw new NotFoundException('瓶子不存在');
    const targetId =
      bottle.userId === userId ? bottle.pickedUserId : bottle.userId;
    if (!targetId) throw new NotFoundException('无法建立会话');

    const { sessionId } = await this.chatService.createDirectSession(
      userId,
      targetId,
      1,
    );
    await this.chatService.sendMessage(userId, {
      sessionId: Number(sessionId),
      content,
      messageType: 1,
    });

    if (bottle.status === 2) {
      bottle.status = 3;
      await this.bottleRepo.save(bottle);
    }

    return { sessionId, success: true };
  }

  private async toBottleView(bottle: DriftBottleEntity) {
    const author = bottle.isAnonymous
      ? null
      : await this.userRepo.findOne({ where: { id: bottle.userId } });
    const statusLabel =
      bottle.status === 1
        ? '漂流中'
        : bottle.status === 2
          ? '已被捞取'
          : '已回复';
    return {
      id: bottle.id,
      content: bottle.content,
      city: bottle.city,
      isAnonymous: !!bottle.isAnonymous,
      status: bottle.status,
      statusLabel,
      author: author
        ? { nickname: author.nickname, avatar: author.avatar }
        : { nickname: '匿名旅人', avatar: '' },
      createdAt: bottle.createdAt,
    };
  }
}
