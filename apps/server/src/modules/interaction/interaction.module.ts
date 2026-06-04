import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectRecordEntity } from '../../entities/collect-record.entity';
import { CommentEntity } from '../../entities/comment.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { LikeRecordEntity } from '../../entities/like-record.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LikeRecordEntity,
      CollectRecordEntity,
      CommentEntity,
      PostEntity,
      DiaryEntity,
      UserEntity,
    ]),
    NotificationModule,
  ],
  controllers: [InteractionController],
  providers: [InteractionService],
})
export class InteractionModule {}
