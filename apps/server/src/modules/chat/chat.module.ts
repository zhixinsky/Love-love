import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from '../../entities/chat-message.entity';
import { ChatSessionEntity } from '../../entities/chat-session.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      ChatSessionEntity,
      ChatMessageEntity,
      UserEntity,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
