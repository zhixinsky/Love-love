import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { UserEntity } from '../../entities/user.entity';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoupleEntity, UserEntity])],
  controllers: [CoupleController],
  providers: [CoupleService],
  exports: [CoupleService],
})
export class CoupleModule {}
