import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { entities } from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { UserModule } from './modules/user/user.module';
import { CoupleModule } from './modules/couple/couple.module';
import { DiaryModule } from './modules/diary/diary.module';
import { PostModule } from './modules/post/post.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { BottleModule } from './modules/bottle/bottle.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { AnniversaryModule } from './modules/anniversary/anniversary.module';
import { WishModule } from './modules/wish/wish.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReportModule } from './modules/report/report.module';
import { AdminModule } from './modules/admin/admin.module';
import { SmsModule } from './modules/sms/sms.module';
import { VipModule } from './modules/vip/vip.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SmsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'love_app',
      entities,
      synchronize: process.env.NODE_ENV !== 'production',
      timezone: '+08:00',
    }),
    AuthModule,
    UserModule,
    CoupleModule,
    DiaryModule,
    PostModule,
    InteractionModule,
    BottleModule,
    ChatModule,
    AiModule,
    AnniversaryModule,
    WishModule,
    NotificationModule,
    UploadModule,
    ReportModule,
    AdminModule,
    VipModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
