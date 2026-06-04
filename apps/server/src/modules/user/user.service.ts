import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { FollowEntity } from '../../entities/follow.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserBlockEntity } from '../../entities/user-block.entity';
import { UserEntity } from '../../entities/user.entity';
import { distanceKm, formatDistance } from '../../common/utils/geo';
import { PostService } from '../post/post.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    @InjectRepository(DiaryEntity)
    private readonly diaryRepo: Repository<DiaryEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
    @InjectRepository(UserBlockEntity)
    private readonly blockRepo: Repository<UserBlockEntity>,
    private readonly postService: PostService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.toProfile(user);
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (dto.showNearby !== undefined) user.showNearby = dto.showNearby ? 1 : 0;
    if (dto.allowDm !== undefined) user.allowDm = dto.allowDm ? 1 : 0;
    await this.userRepo.save(user);
    return {
      success: true,
      showNearby: user.showNearby,
      allowDm: user.allowDm,
    };
  }

  async getPrivacy(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return {
      showNearby: user.showNearby ?? 1,
      allowDm: user.allowDm ?? 1,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    Object.assign(user, {
      nickname: dto.nickname ?? user.nickname,
      avatar: dto.avatar ?? user.avatar,
      gender: dto.gender ?? user.gender,
      birthday: dto.birthday ?? user.birthday,
      city: dto.city ?? user.city,
      bio: dto.bio ?? user.bio,
    });
    await this.userRepo.save(user);
    return { success: true };
  }

  async getHome(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const couple = await this.coupleRepo.findOne({
      where: [
        { userId, status: 1 },
        { partnerId: userId, status: 1 },
      ],
    });

    let coupleInfo: Record<string, unknown> | null = null;
    if (couple) {
      const partnerId =
        couple.userId === userId ? couple.partnerId : couple.userId;
      const partner = partnerId
        ? await this.userRepo.findOne({ where: { id: partnerId } })
        : null;
      const loveDays = couple.loveStartDate
        ? this.calcLoveDays(couple.loveStartDate as unknown as string)
        : 0;
      coupleInfo = {
        coupleId: couple.id,
        loveDays,
        partnerNickname: partner?.nickname || '另一半',
        partnerAvatar: partner?.avatar || '',
      };
    }

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        loveStatus: user.loveStatus,
      },
      couple: coupleInfo,
      stats: {
        diaryCount: await this.diaryRepo.count({
          where: { userId, status: 1 },
        }),
        postCount: await this.postRepo.count({
          where: { userId, status: 1 },
        }),
        followCount: await this.followRepo.count({ where: { userId } }),
        fansCount: await this.followRepo.count({
          where: { targetUserId: userId },
        }),
      },
    };
  }

  async getPublicPosts(
    viewerId: string,
    targetId: string,
    page = 1,
    pageSize = 20,
  ) {
    const user = await this.userRepo.findOne({ where: { id: targetId, status: 1 } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.postService.listPublicPosts(viewerId, targetId, page, pageSize);
  }

  async soulMatch(userId: string, limit = 10) {
    const me = await this.userRepo.findOne({ where: { id: userId } });
    if (!me) throw new NotFoundException('用户不存在');

    const myDiaries = await this.diaryRepo.find({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
      take: 15,
    });
    const myMoods = new Set(
      myDiaries.map((d) => d.mood).filter(Boolean) as string[],
    );

    const blockedIds = await this.getBlockedUserIds(userId);
    const candidates = await this.userRepo
      .createQueryBuilder('u')
      .where('u.status = 1')
      .andWhere('u.id != :userId', { userId })
      .orderBy('RAND()')
      .take(80)
      .getMany();

    const scored = await Promise.all(
      candidates
        .filter((u) => !blockedIds.has(u.id))
        .map(async (u) => {
          const { score, reasons } = await this.calcSoulScore(me, u, myMoods);
          return { user: u, score, reasons };
        }),
    );

    const list = scored
      .filter((x) => x.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => ({
        id: x.user.id,
        nickname: x.user.nickname,
        avatar: x.user.avatar,
        city: x.user.city || '',
        bio: x.user.bio || '',
        gender: x.user.gender,
        loveStatus: x.user.loveStatus,
        matchScore: x.score,
        matchPercent: Math.min(98, Math.round(x.score * 0.9 + 10)),
        reasons: x.reasons,
      }));

    return { list };
  }

  async getPublicProfile(viewerId: string, targetId: string) {
    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('用户不存在');
    const followed = await this.followRepo.findOne({
      where: { userId: viewerId, targetUserId: targetId },
    });
    const canMessage = await this.canSendDirectMessage(viewerId, targetId);
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      city: user.city,
      isFollowed: Boolean(followed),
      canMessage,
      stats: {
        postCount: await this.postRepo.count({
          where: { userId: targetId, status: 1 },
        }),
        diaryCount: await this.diaryRepo.count({
          where: { userId: targetId, status: 1, visibility: 3 },
        }),
        fansCount: await this.followRepo.count({
          where: { targetUserId: targetId },
        }),
      },
    };
  }

  async toggleFollow(userId: string, targetUserId: number) {
    if (String(targetUserId) === userId) {
      throw new NotFoundException('不能关注自己');
    }
    const existing = await this.followRepo.findOne({
      where: { userId, targetUserId: String(targetUserId) },
    });
    if (existing) {
      await this.followRepo.remove(existing);
      return { followed: false };
    }
    await this.followRepo.save(
      this.followRepo.create({
        userId,
        targetUserId: String(targetUserId),
      }),
    );
    return { followed: true };
  }

  async followingList(userId: string, page = 1, pageSize = 20) {
    const [rows, total] = await this.followRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const list = await Promise.all(
      rows.map(async (r) => {
        const u = await this.userRepo.findOne({
          where: { id: r.targetUserId },
        });
        return u
          ? { id: u.id, nickname: u.nickname, avatar: u.avatar }
          : null;
      }),
    );
    return { list: list.filter(Boolean), total };
  }

  async followersList(userId: string, page = 1, pageSize = 20) {
    const [rows, total] = await this.followRepo.findAndCount({
      where: { targetUserId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const list = await Promise.all(
      rows.map(async (r) => {
        const u = await this.userRepo.findOne({ where: { id: r.userId } });
        return u
          ? { id: u.id, nickname: u.nickname, avatar: u.avatar }
          : null;
      }),
    );
    return { list: list.filter(Boolean), total };
  }

  async blockList(userId: string) {
    const rows = await this.blockRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const list = await Promise.all(
      rows.map(async (r) => {
        const u = await this.userRepo.findOne({
          where: { id: r.blockedUserId },
        });
        return u
          ? { userId: u.id, nickname: u.nickname, avatar: u.avatar }
          : null;
      }),
    );
    return { list: list.filter(Boolean) };
  }

  async unblock(userId: string, blockedUserId: number) {
    await this.blockRepo.delete({
      userId,
      blockedUserId: String(blockedUserId),
    });
    return { success: true };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.latitude = dto.latitude;
    user.longitude = dto.longitude;
    user.locationUpdatedAt = new Date();
    await this.userRepo.save(user);
    return { success: true };
  }

  async nearbyUsers(userId: string, limit = 20) {
    const me = await this.userRepo.findOne({ where: { id: userId } });
    if (
      me?.latitude == null ||
      me?.longitude == null ||
      Number.isNaN(Number(me.latitude)) ||
      Number.isNaN(Number(me.longitude))
    ) {
      return { list: [], needLocation: true };
    }

    const blockedIds = await this.getBlockedUserIds(userId);
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.status = 1')
      .andWhere('u.id != :userId', { userId })
      .andWhere('u.latitude IS NOT NULL')
      .andWhere('u.longitude IS NOT NULL')
      .andWhere('(u.show_nearby = 1 OR u.show_nearby IS NULL)')
      .getMany();

    const myLat = Number(me.latitude);
    const myLng = Number(me.longitude);

    const list = users
      .filter((u) => !blockedIds.has(u.id))
      .map((u) => {
        const km = distanceKm(
          myLat,
          myLng,
          Number(u.latitude),
          Number(u.longitude),
        );
        return {
          id: u.id,
          nickname: u.nickname,
          avatar: u.avatar,
          city: u.city || '未知',
          distance: formatDistance(km),
          distanceKm: km,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit)
      .map(({ distanceKm: _d, ...rest }) => rest);

    return { list, needLocation: false };
  }

  private async getBlockedUserIds(userId: string) {
    const blocked = await this.blockRepo.find({ where: { userId } });
    const blockedBy = await this.blockRepo.find({
      where: { blockedUserId: userId },
    });
    const ids = new Set<string>();
    blocked.forEach((r) => ids.add(r.blockedUserId));
    blockedBy.forEach((r) => ids.add(r.userId));
    return ids;
  }

  async blockUser(userId: string, blockedUserId: number) {
    const exists = await this.blockRepo.findOne({
      where: { userId, blockedUserId: String(blockedUserId) },
    });
    if (!exists) {
      await this.blockRepo.save(
        this.blockRepo.create({
          userId,
          blockedUserId: String(blockedUserId),
        }),
      );
    }
    return { success: true };
  }

  /** 双方是否互相关注 */
  async isMutualFollow(userIdA: string, userIdB: string) {
    const [aToB, bToA] = await Promise.all([
      this.followRepo.findOne({
        where: { userId: userIdA, targetUserId: userIdB },
      }),
      this.followRepo.findOne({
        where: { userId: userIdB, targetUserId: userIdA },
      }),
    ]);
    return Boolean(aToB && bToA);
  }

  /** 是否允许 sender 向 receiver 发起私聊 */
  async canSendDirectMessage(senderId: string, receiverId: string) {
    if (senderId === receiverId) return true;
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
    if (!receiver) return false;
    if (receiver.allowDm === 0) {
      return this.isMutualFollow(senderId, receiverId);
    }
    return true;
  }

  private async calcSoulScore(
    me: UserEntity,
    other: UserEntity,
    myMoods: Set<string>,
  ) {
    const reasons: string[] = [];
    let score = 0;

    if (me.city && other.city && me.city === other.city) {
      score += 28;
      reasons.push('同城');
    }

    if (me.loveStatus === other.loveStatus) {
      score += 12;
      const statusLabel =
        other.loveStatus === 1
          ? '同为恋爱中'
          : other.loveStatus === 2
            ? '同为已婚'
            : '同为单身';
      reasons.push(statusLabel);
    }

    if (
      me.gender &&
      other.gender &&
      me.gender !== other.gender &&
      me.gender !== 0 &&
      other.gender !== 0
    ) {
      score += 15;
      reasons.push('性别互补');
    }

    const ageGap = this.ageGapYears(me.birthday, other.birthday);
    if (ageGap !== null && ageGap <= 6) {
      score += 12;
      reasons.push('年龄相近');
    }

    const theirDiaries = await this.diaryRepo.find({
      where: { userId: other.id, status: 1 },
      take: 8,
      order: { createdAt: 'DESC' },
    });
    const sharedMood = theirDiaries.some(
      (d) => d.mood && myMoods.has(d.mood),
    );
    if (sharedMood) {
      score += 22;
      reasons.push('心情共鸣');
    }

    if (other.bio && other.bio.length >= 8) {
      score += 6;
    }

    if (reasons.length === 0 && score < 20) {
      score += 15;
      reasons.push('今日缘分');
    }

    return { score, reasons: reasons.slice(0, 3) };
  }

  private ageGapYears(a?: string, b?: string): number | null {
    const da = a ? new Date(a) : null;
    const db = b ? new Date(b) : null;
    if (!da || !db || Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) {
      return null;
    }
    return Math.abs(da.getFullYear() - db.getFullYear());
  }

  private toProfile(user: UserEntity) {
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday,
      city: user.city,
      bio: user.bio,
      loveStatus: user.loveStatus,
      isVerified: user.isVerified,
      showNearby: user.showNearby ?? 1,
      allowDm: user.allowDm ?? 1,
    };
  }

  private calcLoveDays(startDate: string) {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  }
}
