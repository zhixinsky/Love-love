import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from '../../entities/follow.entity';
import { CollectRecordEntity } from '../../entities/collect-record.entity';
import { LikeRecordEntity } from '../../entities/like-record.entity';
import { PostMediaEntity } from '../../entities/post-media.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(PostMediaEntity)
    private readonly mediaRepo: Repository<PostMediaEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(LikeRecordEntity)
    private readonly likeRepo: Repository<LikeRecordEntity>,
    @InjectRepository(CollectRecordEntity)
    private readonly collectRepo: Repository<CollectRecordEntity>,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    const post = this.postRepo.create({
      userId,
      content: dto.content,
      topicId: dto.topicId ? String(dto.topicId) : null,
      city: dto.city,
      location: dto.location,
      postType: 1,
      status: process.env.CONTENT_AUDIT_ENABLED === 'true' ? 2 : 1,
    });
    await this.postRepo.save(post);
    for (const m of dto.mediaList || []) {
      await this.mediaRepo.save(
        this.mediaRepo.create({
          postId: post.id,
          mediaType: m.mediaType,
          url: m.url,
          sort: m.sort,
        }),
      );
    }
    return {
      postId: post.id,
      status: post.status,
      message:
        post.status === 2 ? '已提交审核，通过后将展示在广场' : '发布成功',
    };
  }

  async list(
    userId: string,
    page = 1,
    pageSize = 20,
    tab = 'recommend',
    city?: string,
  ) {
    const qb = this.postRepo
      .createQueryBuilder('p')
      .where('p.status = 1')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (tab === 'single') {
      qb.innerJoin(UserEntity, 'u', 'u.id = p.userId').andWhere(
        'u.loveStatus = 0',
      );
    } else if (tab === 'couple') {
      qb.innerJoin(UserEntity, 'u', 'u.id = p.userId').andWhere(
        'u.loveStatus = 1',
      );
    } else if (tab === 'nearby' && city) {
      qb.andWhere('p.city = :city', { city });
    } else if (tab === 'mine') {
      qb.andWhere('p.userId = :userId', { userId });
    } else if (tab === 'follow') {
      qb.innerJoin(
        FollowEntity,
        'f',
        'f.targetUserId = p.userId AND f.userId = :userId',
        { userId },
      );
    }

    const [rows, total] = await qb.getManyAndCount();
    const list = await Promise.all(
      rows.map((p) => this.toPostItem(p, userId)),
    );
    return { list, total };
  }

  async listPublicPosts(
    viewerId: string,
    targetUserId: string,
    page = 1,
    pageSize = 20,
  ) {
    const [rows, total] = await this.postRepo.findAndCount({
      where: { userId: targetUserId, status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const list = await Promise.all(
      rows.map((p) => this.toPostItem(p, viewerId)),
    );
    return { list, total };
  }

  async detail(userId: string, id: string) {
    const post = await this.postRepo.findOne({ where: { id, status: 1 } });
    if (!post) throw new NotFoundException('动态不存在');
    return this.toPostItem(post, userId, true);
  }

  async remove(userId: string, id: string) {
    const post = await this.postRepo.findOne({ where: { id, status: 1 } });
    if (!post) throw new NotFoundException('动态不存在');
    if (post.userId !== userId) throw new ForbiddenException('无权删除');
    post.status = 4;
    await this.postRepo.save(post);
    return { success: true };
  }

  private async toPostItem(
    post: PostEntity,
    viewerId: string,
    withDetail = false,
  ) {
    const author = await this.userRepo.findOne({ where: { id: post.userId } });
    const media = await this.mediaRepo.find({
      where: { postId: post.id },
      order: { sort: 'ASC' },
    });
    const liked = !!(await this.likeRepo.findOne({
      where: { userId: viewerId, targetType: 1, targetId: post.id },
    }));
    const collected = !!(await this.collectRepo.findOne({
      where: { userId: viewerId, targetType: 1, targetId: post.id },
    }));
    return {
      id: post.id,
      content: post.content,
      author: {
        id: author?.id,
        nickname: author?.nickname,
        avatar: author?.avatar,
      },
      mediaList: media.map((m) => ({
        mediaType: m.mediaType,
        url: m.url,
        sort: m.sort,
      })),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      collectCount: post.collectCount,
      isLiked: liked,
      isCollected: collected,
      createdAt: post.createdAt,
      ...(withDetail ? { city: post.city, location: post.location } : {}),
    };
  }
}
