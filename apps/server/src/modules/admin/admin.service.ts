import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AiReportEntity } from '../../entities/ai-report.entity';
import { AiUsageLogEntity } from '../../entities/ai-usage-log.entity';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { PostEntity } from '../../entities/post.entity';
import { ReportEntity } from '../../entities/report.entity';
import { UserEntity } from '../../entities/user.entity';
import { AdminUserEntity } from '../../entities/admin-user.entity';
import { AuditHandleDto } from './dto/audit-handle.dto';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(DiaryEntity)
    private readonly diaryRepo: Repository<DiaryEntity>,
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    @InjectRepository(AiReportEntity)
    private readonly aiReportRepo: Repository<AiReportEntity>,
    @InjectRepository(AiUsageLogEntity)
    private readonly aiUsageRepo: Repository<AiUsageLogEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await this.adminRepo.save(
        this.adminRepo.create({
          username: 'admin',
          password: hash,
          status: 1,
        }),
      );
    }
  }

  async login(username: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (!admin || admin.status !== 1) {
      throw new UnauthorizedException('账号或密码错误');
    }
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new UnauthorizedException('账号或密码错误');
    const token = this.jwtService.sign({
      sub: admin.id,
      role: 'admin',
    });
    return { token };
  }

  async auditList() {
    const posts = await this.postRepo.find({
      where: { status: 2 },
      take: 50,
      order: { createdAt: 'DESC' },
    });
    const reports = await this.reportRepo.find({
      where: { status: 0 },
      take: 50,
      order: { createdAt: 'DESC' },
    });
    return { posts, reports };
  }

  async auditHandle(dto: AuditHandleDto) {
    if (dto.targetType === 'post') {
      await this.postRepo.update(dto.targetId, {
        status: dto.action === 'approve' ? 1 : 3,
      });
    } else if (dto.targetType === 'report') {
      await this.reportRepo.update(dto.targetId, {
        status: dto.action === 'approve' ? 1 : 2,
      });
      if (dto.hideContent && dto.relatedPostId) {
        await this.postRepo.update(dto.relatedPostId, { status: 3 });
      }
    }
    return { success: true };
  }

  async dashboard() {
    const userCount = await this.userRepo.count();
    const diaryCount = await this.diaryRepo.count({ where: { status: 1 } });
    const postCount = await this.postRepo.count({ where: { status: 1 } });
    const reportPending = await this.reportRepo.count({ where: { status: 0 } });
    const coupleCount = await this.coupleRepo.count({ where: { status: 1 } });
    const aiReportCount = await this.aiReportRepo.count();
    const aiUsageCount = await this.aiUsageRepo.count();
    return {
      userCount,
      diaryCount,
      postCount,
      reportPending,
      coupleCount,
      aiReportCount,
      aiUsageCount,
      coupleBindRate:
        userCount > 0 ? Math.round((coupleCount / userCount) * 100) : 0,
    };
  }

  async userList(page = 1, pageSize = 20, keyword?: string) {
    const qb = this.userRepo.createQueryBuilder('u');
    if (keyword) {
      qb.andWhere('u.nickname LIKE :kw OR u.mobile LIKE :kw', {
        kw: `%${keyword}%`,
      });
    }
    const [list, total] = await qb
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list: list.map((u) => ({
        id: u.id,
        nickname: u.nickname,
        mobile: u.mobile,
        status: u.status,
        createdAt: u.createdAt,
      })),
      total,
    };
  }

  async setUserStatus(userId: string, status: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = status;
    await this.userRepo.save(user);
    return { success: true };
  }

  async reportList(page = 1, pageSize = 20) {
    const [list, total] = await this.reportRepo.findAndCount({
      where: { status: 0 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  async aiStats() {
    const reportCount = await this.aiReportRepo.count();
    const usageCount = await this.aiUsageRepo.count();
    const tokenSum = await this.aiUsageRepo
      .createQueryBuilder('l')
      .select('SUM(l.totalTokens)', 'sum')
      .getRawOne<{ sum: string }>();
    return {
      reportCount,
      usageCount,
      totalTokens: Number(tokenSum?.sum || 0),
    };
  }
}
