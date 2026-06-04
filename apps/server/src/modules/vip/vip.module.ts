import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { OrderEntity } from '../../entities/order.entity';
import { UserEntity } from '../../entities/user.entity';
import { VipUserEntity } from '../../entities/vip-user.entity';
import { VipController } from './vip.controller';
import { VipService } from './vip.service';
import { WechatPayService } from './wechat-pay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      VipUserEntity,
      CoupleEntity,
      UserEntity,
    ]),
  ],
  controllers: [VipController],
  providers: [VipService, WechatPayService],
  exports: [VipService],
})
export class VipModule {}
