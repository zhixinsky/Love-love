import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnniversaryEntity } from '../../entities/anniversary.entity';
import { CoupleEntity } from '../../entities/couple.entity';
import { AnniversaryController } from './anniversary.controller';
import { AnniversaryService } from './anniversary.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnniversaryEntity, CoupleEntity])],
  controllers: [AnniversaryController],
  providers: [AnniversaryService],
})
export class AnniversaryModule {}
