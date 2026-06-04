import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriftBottleEntity } from '../../entities/drift-bottle.entity';
import { UserEntity } from '../../entities/user.entity';
import { ChatModule } from '../chat/chat.module';
import { BottleController } from './bottle.controller';
import { BottleService } from './bottle.service';

@Module({
  imports: [
    ChatModule,
    TypeOrmModule.forFeature([DriftBottleEntity, UserEntity]),
  ],
  controllers: [BottleController],
  providers: [BottleService],
})
export class BottleModule {}
