import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { WishEntity } from '../../entities/wish.entity';
import { WishController } from './wish.controller';
import { WishService } from './wish.service';

@Module({
  imports: [TypeOrmModule.forFeature([WishEntity, CoupleEntity])],
  controllers: [WishController],
  providers: [WishService],
})
export class WishModule {}
