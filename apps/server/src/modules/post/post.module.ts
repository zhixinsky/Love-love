import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectRecordEntity } from '../../entities/collect-record.entity';
import { LikeRecordEntity } from '../../entities/like-record.entity';
import { PostMediaEntity } from '../../entities/post-media.entity';
import { PostEntity } from '../../entities/post.entity';
import { FollowEntity } from '../../entities/follow.entity';
import { UserEntity } from '../../entities/user.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostMediaEntity,
      UserEntity,
      FollowEntity,
      LikeRecordEntity,
      CollectRecordEntity,
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
