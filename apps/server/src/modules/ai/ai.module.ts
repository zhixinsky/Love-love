import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMemoryEntity } from '../../entities/ai-memory.entity';
import { AiReportEntity } from '../../entities/ai-report.entity';
import { ChatMessageEntity } from '../../entities/chat-message.entity';
import { ChatSessionEntity } from '../../entities/chat-session.entity';
import { CoupleEntity } from '../../entities/couple.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { AiController } from './ai.controller';
import { AiPromptService } from './ai-prompt.service';
import { AiService } from './ai.service';
import { AiChatService } from './services/ai-chat.service';
import { AiConcurrencyService } from './services/ai-concurrency.service';
import { AiUsageLogEntity } from '../../entities/ai-usage-log.entity';
import { AiUsageService } from './services/ai-usage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSessionEntity,
      ChatMessageEntity,
      DiaryEntity,
      AiMemoryEntity,
      AiReportEntity,
      CoupleEntity,
      AiUsageLogEntity,
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiChatService,
    AiConcurrencyService,
    AiPromptService,
    AiUsageService,
  ],
})
export class AiModule {}
