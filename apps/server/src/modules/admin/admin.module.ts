import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiReportEntity } from '../../entities/ai-report.entity';
import { AiUsageLogEntity } from '../../entities/ai-usage-log.entity';
import { AdminUserEntity } from '../../entities/admin-user.entity';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { PostEntity } from '../../entities/post.entity';
import { ReportEntity } from '../../entities/report.entity';
import { UserEntity } from '../../entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUserEntity,
      PostEntity,
      DiaryEntity,
      ReportEntity,
      UserEntity,
      CoupleEntity,
      AiReportEntity,
      AiUsageLogEntity,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
