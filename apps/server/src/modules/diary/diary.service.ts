import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryMediaEntity } from '../../entities/diary-media.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import {
  findActiveCouple,
  getPartnerId,
} from '../../common/helpers/couple.helper';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntity)
    private readonly diaryRepo: Repository<DiaryEntity>,
    @InjectRepository(DiaryMediaEntity)
    private readonly mediaRepo: Repository<DiaryMediaEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(userId: string, dto: CreateDiaryDto) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    const diary = this.diaryRepo.create({
      userId,
      coupleId: couple?.id || null,
      title: dto.title,
      content: dto.content,
      mood: dto.mood,
      weather: dto.weather,
      location: dto.location,
      visibility: dto.visibility,
      status: 1,
    });
    await this.diaryRepo.save(diary);
    await this.saveMedia(diary.id, userId, dto.mediaList || []);
    if (dto.visibility === 3) {
      await this.syncToPost(userId, diary);
    }
    return { diaryId: diary.id };
  }

  async list(
    userId: string,
    page = 1,
    pageSize = 20,
    visibility?: number,
  ) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    const qb = this.diaryRepo
      .createQueryBuilder('d')
      .where('d.status = 1')
      .orderBy('d.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (visibility === 1) {
      qb.andWhere('d.userId = :userId', { userId });
      qb.andWhere('d.visibility = 1');
    } else if (visibility === 2 && couple) {
      const pid = getPartnerId(couple, userId);
      qb.andWhere('(d.userId = :userId OR d.userId = :pid)', {
        userId,
        pid: pid || '0',
      });
      qb.andWhere('d.visibility = 2');
    } else if (visibility === 3) {
      qb.andWhere('d.visibility = 3');
    } else {
      qb.andWhere(
        '(d.userId = :userId OR (d.visibility = 2 AND d.coupleId = :cid))',
        { userId, cid: couple?.id || '0' },
      );
    }

    const [rows, total] = await qb.getManyAndCount();
    const list = await Promise.all(rows.map((d) => this.toListItem(d)));
    return { list, total };
  }

  async detail(userId: string, id: string) {
    const diary = await this.diaryRepo.findOne({ where: { id, status: 1 } });
    if (!diary) throw new NotFoundException('日记不存在');
    if (!(await this.canView(userId, diary)))
      throw new ForbiddenException('无权查看');
    const author = await this.userRepo.findOne({ where: { id: diary.userId } });
    const mediaList = await this.mediaRepo.find({
      where: { diaryId: id },
      order: { sort: 'ASC' },
    });
    return {
      id: diary.id,
      title: diary.title,
      content: diary.content,
      mood: diary.mood,
      weather: diary.weather,
      location: diary.location,
      visibility: diary.visibility,
      mediaList: mediaList.map((m) => ({
        mediaType: m.mediaType,
        url: m.url,
        sort: m.sort,
      })),
      author: {
        id: author?.id,
        nickname: author?.nickname,
        avatar: author?.avatar,
      },
      createdAt: diary.createdAt,
    };
  }

  async update(userId: string, id: string, dto: UpdateDiaryDto) {
    const diary = await this.requireOwner(userId, id);
    Object.assign(diary, {
      title: dto.title ?? diary.title,
      content: dto.content ?? diary.content,
      mood: dto.mood ?? diary.mood,
      weather: dto.weather ?? diary.weather,
      location: dto.location ?? diary.location,
      visibility: dto.visibility ?? diary.visibility,
    });
    await this.diaryRepo.save(diary);
    if (dto.mediaList) {
      await this.mediaRepo.delete({ diaryId: id });
      await this.saveMedia(id, userId, dto.mediaList);
    }
    return { success: true };
  }

  async remove(userId: string, id: string) {
    const diary = await this.requireOwner(userId, id);
    diary.status = 3;
    await this.diaryRepo.save(diary);
    return { success: true };
  }

  private async requireOwner(userId: string, id: string) {
    const diary = await this.diaryRepo.findOne({ where: { id, status: 1 } });
    if (!diary) throw new NotFoundException('日记不存在');
    if (diary.userId !== userId) throw new ForbiddenException('无权操作');
    return diary;
  }

  private async canView(userId: string, diary: DiaryEntity) {
    if (diary.userId === userId) return true;
    if (diary.visibility === 1) return false;
    if (diary.visibility === 3) return true;
    if (diary.visibility === 2 && diary.coupleId) {
      const couple = await findActiveCouple(this.coupleRepo, userId);
      return couple?.id === diary.coupleId;
    }
    return false;
  }

  private async saveMedia(
    diaryId: string,
    userId: string,
    mediaList: { mediaType: number; url: string; sort: number }[],
  ) {
    for (const m of mediaList) {
      await this.mediaRepo.save(
        this.mediaRepo.create({
          diaryId,
          userId,
          mediaType: m.mediaType,
          url: m.url,
          sort: m.sort,
        }),
      );
    }
  }

  private async syncToPost(userId: string, diary: DiaryEntity) {
    await this.postRepo.save(
      this.postRepo.create({
        userId,
        content: diary.content || diary.title,
        postType: 2,
        sourceId: diary.id,
        status: 1,
      }),
    );
  }

  private async toListItem(d: DiaryEntity) {
    const media = await this.mediaRepo.find({
      where: { diaryId: d.id },
      order: { sort: 'ASC' },
    });
    return {
      id: d.id,
      title: d.title,
      content: d.content,
      mood: d.mood,
      visibility: d.visibility,
      mediaList: media.map((m) => ({ url: m.url, mediaType: m.mediaType })),
      createdAt: d.createdAt,
    };
  }
}
