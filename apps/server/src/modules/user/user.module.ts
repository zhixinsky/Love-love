import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { FollowEntity } from '../../entities/follow.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserBlockEntity } from '../../entities/user-block.entity';
import { UserEntity } from '../../entities/user.entity';
import { PostModule } from '../post/post.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CoupleEntity,
      DiaryEntity,
      PostEntity,
      FollowEntity,
      UserBlockEntity,
    ]),
    PostModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
