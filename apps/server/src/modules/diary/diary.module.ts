import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryMediaEntity } from '../../entities/diary-media.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiaryEntity,
      DiaryMediaEntity,
      PostEntity,
      CoupleEntity,
      UserEntity,
    ]),
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [DiaryService],
})
export class DiaryModule {}
