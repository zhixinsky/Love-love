import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectRecordEntity } from '../../entities/collect-record.entity';
import { CommentEntity } from '../../entities/comment.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { LikeRecordEntity } from '../../entities/like-record.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ToggleTargetDto } from './dto/toggle-target.dto';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(LikeRecordEntity)
    private readonly likeRepo: Repository<LikeRecordEntity>,
    @InjectRepository(CollectRecordEntity)
    private readonly collectRepo: Repository<CollectRecordEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(DiaryEntity)
    private readonly diaryRepo: Repository<DiaryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async toggleLike(userId: string, dto: ToggleTargetDto) {
    const existing = await this.likeRepo.findOne({
      where: {
        userId,
        targetType: dto.targetType,
        targetId: String(dto.targetId),
      },
    });
    let liked = false;
    if (existing) {
      await this.likeRepo.remove(existing);
      liked = false;
      await this.adjustLikeCount(dto.targetType, dto.targetId, -1);
    } else {
      await this.likeRepo.save(
        this.likeRepo.create({
          userId,
          targetType: dto.targetType,
          targetId: String(dto.targetId),
        }),
      );
      liked = true;
      await this.adjustLikeCount(dto.targetType, dto.targetId, 1);
      const ownerId = await this.getTargetOwnerId(dto.targetType, dto.targetId);
      if (ownerId && ownerId !== userId) {
        await this.notificationService.create({
          userId: ownerId,
          type: 1,
          title: '收到点赞',
          content: '有人赞了你的内容',
          relatedType: dto.targetType,
          relatedId: String(dto.targetId),
        });
      }
    }
    const count = await this.getLikeCount(dto.targetType, dto.targetId);
    return { liked, likeCount: count };
  }

  async toggleCollect(userId: string, dto: ToggleTargetDto) {
    const existing = await this.collectRepo.findOne({
      where: {
        userId,
        targetType: dto.targetType,
        targetId: String(dto.targetId),
      },
    });
    let collected = false;
    if (existing) {
      await this.collectRepo.remove(existing);
      if (dto.targetType === 1) {
        await this.postRepo.decrement(
          { id: String(dto.targetId) },
          'collectCount',
          1,
        );
      }
    } else {
      await this.collectRepo.save(
        this.collectRepo.create({
          userId,
          targetType: dto.targetType,
          targetId: String(dto.targetId),
        }),
      );
      collected = true;
      if (dto.targetType === 1) {
        await this.postRepo.increment(
          { id: String(dto.targetId) },
          'collectCount',
          1,
        );
      }
    }
    const post =
      dto.targetType === 1
        ? await this.postRepo.findOne({ where: { id: String(dto.targetId) } })
        : null;
    return { collected, collectCount: post?.collectCount ?? 0 };
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const comment = this.commentRepo.create({
      userId,
      targetType: dto.targetType,
      targetId: String(dto.targetId),
      parentId: dto.parentId ? String(dto.parentId) : '0',
      replyUserId: dto.replyUserId ? String(dto.replyUserId) : '0',
      content: dto.content,
      status: 1,
    });
    await this.commentRepo.save(comment);
    if (dto.targetType === 1) {
      await this.postRepo.increment({ id: String(dto.targetId) }, 'commentCount', 1);
    } else if (dto.targetType === 2) {
      await this.diaryRepo.increment({ id: String(dto.targetId) }, 'commentCount', 1);
    }
    const ownerId = await this.getTargetOwnerId(dto.targetType, dto.targetId);
    if (ownerId && ownerId !== userId) {
      await this.notificationService.create({
        userId: ownerId,
        type: 2,
        title: '收到评论',
        content: dto.content.slice(0, 100),
        relatedType: dto.targetType,
        relatedId: String(dto.targetId),
      });
    }
    return { commentId: comment.id };
  }

  async collectList(userId: string, page = 1, pageSize = 20) {
    const [records, total] = await this.collectRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const list = await Promise.all(
      records.map(async (r) => {
        if (r.targetType === 1) {
          const post = await this.postRepo.findOne({
            where: { id: r.targetId },
          });
          return post
            ? {
                id: r.id,
                targetType: 1,
                targetId: r.targetId,
                title: post.content?.slice(0, 80),
                cover: '',
                createdAt: r.createdAt,
              }
            : null;
        }
        const diary = await this.diaryRepo.findOne({
          where: { id: r.targetId },
        });
        return diary
          ? {
              id: r.id,
              targetType: 2,
              targetId: r.targetId,
              title: diary.title || diary.content?.slice(0, 80),
              cover: '',
              createdAt: r.createdAt,
            }
          : null;
      }),
    );
    return { list: list.filter(Boolean), total };
  }

  async commentList(
    targetType: number,
    targetId: number,
    page = 1,
    pageSize = 20,
  ) {
    const [rows, total] = await this.commentRepo.findAndCount({
      where: { targetType, targetId: String(targetId), status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const list = await Promise.all(
      rows.map(async (c) => {
        const author = await this.userRepo.findOne({ where: { id: c.userId } });
        let replyUser = null;
        if (c.replyUserId && c.replyUserId !== '0') {
          replyUser = await this.userRepo.findOne({
            where: { id: c.replyUserId },
          });
        }
        return {
          id: c.id,
          content: c.content,
          author: {
            id: author?.id,
            nickname: author?.nickname,
            avatar: author?.avatar,
          },
          replyUser: replyUser
            ? { id: replyUser.id, nickname: replyUser.nickname }
            : null,
          likeCount: 0,
          createdAt: c.createdAt,
        };
      }),
    );
    return { list, total };
  }

  private async adjustLikeCount(
    targetType: number,
    targetId: number,
    delta: number,
  ) {
    if (targetType === 1) {
      if (delta > 0)
        await this.postRepo.increment({ id: String(targetId) }, 'likeCount', 1);
      else
        await this.postRepo.decrement({ id: String(targetId) }, 'likeCount', 1);
    } else if (targetType === 2) {
      if (delta > 0)
        await this.diaryRepo.increment({ id: String(targetId) }, 'likeCount', 1);
      else
        await this.diaryRepo.decrement({ id: String(targetId) }, 'likeCount', 1);
    }
  }

  private async getLikeCount(targetType: number, targetId: number) {
    if (targetType === 1) {
      const p = await this.postRepo.findOne({ where: { id: String(targetId) } });
      return p?.likeCount ?? 0;
    }
    if (targetType === 2) {
      const d = await this.diaryRepo.findOne({ where: { id: String(targetId) } });
      return d?.likeCount ?? 0;
    }
    return 0;
  }

  private async getTargetOwnerId(targetType: number, targetId: number) {
    if (targetType === 1) {
      const p = await this.postRepo.findOne({ where: { id: String(targetId) } });
      return p?.userId;
    }
    if (targetType === 2) {
      const d = await this.diaryRepo.findOne({ where: { id: String(targetId) } });
      return d?.userId;
    }
    return null;
  }
}
