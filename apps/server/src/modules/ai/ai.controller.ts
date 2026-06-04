import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('session')
  createSession(@CurrentUser('userId') userId: string) {
    return this.aiService.createSession(userId);
  }

  @Post('chat')
  chat(@CurrentUser('userId') userId: string, @Body() dto: AiChatDto) {
    return this.aiService.chat(userId, dto);
  }

  @Get('memory/list')
  memoryList(@CurrentUser('userId') userId: string) {
    return this.aiService.memoryList(userId);
  }

  @Delete('memory/:id')
  deleteMemory(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.aiService.deleteMemory(userId, id);
  }

  @Post('report/generate')
  generateReport(@CurrentUser('userId') userId: string) {
    return this.aiService.generateReport(userId);
  }

  @Get('report/:id')
  getReport(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.aiService.getReport(userId, id);
  }
}
