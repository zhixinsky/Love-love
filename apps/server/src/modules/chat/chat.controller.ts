import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('session/list')
  sessionList(@CurrentUser('userId') userId: string) {
    return this.chatService.sessionList(userId);
  }

  @Post('session')
  createSession(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.chatService.createDirectSession(
      userId,
      String(dto.targetUserId),
      2,
    );
  }

  @Get('message/list')
  messageList(
    @CurrentUser('userId') userId: string,
    @Query('sessionId') sessionId: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.chatService.messageList(
      sessionId,
      userId,
      q.page,
      q.pageSize,
    );
  }

  @Post('message')
  sendMessage(
    @CurrentUser('userId') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, dto);
  }
}
