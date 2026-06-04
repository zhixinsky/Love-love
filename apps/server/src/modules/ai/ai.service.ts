import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AiMemoryEntity } from '../../entities/ai-memory.entity';
import { AiReportEntity } from '../../entities/ai-report.entity';
import { ChatMessageEntity } from '../../entities/chat-message.entity';
import { ChatSessionEntity } from '../../entities/chat-session.entity';
import { DiaryEntity } from '../../entities/diary.entity';
import { findActiveCouple } from '../../common/helpers/couple.helper';
import { CoupleEntity } from '../../entities/couple.entity';
import { AiPromptService } from './ai-prompt.service';
import { AiChatService } from './services/ai-chat.service';
import { AiUsageService } from './services/ai-usage.service';
import { parseAiJson } from './parsers/ai-json.parser';
import { AiChatDto } from './dto/ai-chat.dto';

interface WeeklyAnalysisJson {
  communication?: number;
  companionship?: number;
  understanding?: number;
  ritual?: number;
  security?: number;
  emotionStability?: number;
  summary?: string;
  suggestion?: string;
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepo: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
    @InjectRepository(DiaryEntity)
    private readonly diaryRepo: Repository<DiaryEntity>,
    @InjectRepository(AiMemoryEntity)
    private readonly memoryRepo: Repository<AiMemoryEntity>,
    @InjectRepository(AiReportEntity)
    private readonly reportRepo: Repository<AiReportEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    private readonly aiChat: AiChatService,
    private readonly prompts: AiPromptService,
    private readonly aiUsage: AiUsageService,
  ) {}

  async createSession(userId: string) {
    let session = await this.sessionRepo.findOne({
      where: { userId, sessionType: 3, status: 1 },
    });
    if (!session) {
      session = this.sessionRepo.create({
        userId,
        sessionType: 3,
        targetUserId: '0',
        lastMessage: '开始和恋恋聊天吧',
        lastMessageTime: new Date(),
        status: 1,
      });
      await this.sessionRepo.save(session);
    }
    return { sessionId: session.id };
  }

  async chat(userId: string, dto: AiChatDto) {
    const session = await this.sessionRepo.findOne({
      where: { id: String(dto.sessionId), userId, sessionType: 3 },
    });
    if (!session) throw new NotFoundException('AI会话不存在');

    await this.messageRepo.save(
      this.messageRepo.create({
        sessionId: session.id,
        senderId: userId,
        receiverId: '0',
        messageType: 1,
        content: dto.content,
        isRead: 1,
      }),
    );

    let diaryContext = '';
    if (dto.useDiaryMemory !== false) {
      const diaries = await this.diaryRepo.find({
        where: { userId, status: 1 },
        order: { createdAt: 'DESC' },
        take: 3,
      });
      diaryContext = diaries.map((d) => d.content).join('\n');
    }

    const memories = await this.memoryRepo.find({
      where: { userId, status: 1 },
      take: 8,
      order: { importance: 'DESC' },
    });
    const memoryText = memories.map((m) => m.content).join('；');

    const couple = await findActiveCouple(this.coupleRepo, userId);
    const loveDays = couple?.bindTime
      ? Math.max(
          1,
          Math.floor(
            (Date.now() - new Date(couple.bindTime).getTime()) / (24 * 3600 * 1000),
          ),
        )
      : undefined;

    const reply = await this.generateLoverReply(
      userId,
      session.id,
      dto.content,
      diaryContext,
      memoryText,
      loveDays,
    );

    await this.messageRepo.save(
      this.messageRepo.create({
        sessionId: session.id,
        senderId: '0',
        receiverId: userId,
        messageType: 1,
        content: reply,
        isRead: 0,
      }),
    );

    session.lastMessage = reply.slice(0, 200);
    session.lastMessageTime = new Date();
    await this.sessionRepo.save(session);

    if (dto.content.length > 10 && this.aiChat.isConfigured()) {
      void this.extractMemoriesFromText(userId, dto.content).catch(() => undefined);
    }

    return {
      reply,
      usedMemories: memories.map((m) => m.content),
      systemPrompt: this.prompts.getLoverSystemPrompt(),
    };
  }

  async memoryList(userId: string) {
    const list = await this.memoryRepo.find({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
    });
    return { list };
  }

  async deleteMemory(userId: string, id: string) {
    const row = await this.memoryRepo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('记忆不存在');
    row.status = 3;
    await this.memoryRepo.save(row);
    return { success: true };
  }

  async generateReport(userId: string) {
    const couple = await findActiveCouple(this.coupleRepo, userId);
    const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const diaries = await this.diaryRepo.find({
      where: { userId, status: 1, createdAt: MoreThan(weekStart) },
      order: { createdAt: 'DESC' },
      take: 30,
    });
    const diaryCount = diaries.length;
    const diaryText =
      diaries.map((d) => `[${d.createdAt}] ${d.title || ''} ${d.content}`).join('\n') ||
      '（本周暂无日记）';

    let analysis: WeeklyAnalysisJson = {};
    let weeklyNarrative = '';

    if (this.aiChat.isConfigured()) {
      const analysisResult = await this.aiChat.completeWithMeta([
        { role: 'system', content: this.prompts.getWeeklyAnalysisPrompt() },
        { role: 'user', content: `本周日记与记录：\n${diaryText}` },
      ]);
      if (analysisResult.content && !analysisResult.busy && !analysisResult.timeout) {
        try {
          analysis = parseAiJson<WeeklyAnalysisJson>(analysisResult.content);
        } catch {
          analysis = {};
        }
      }

      const reportResult = await this.aiChat.completeWithMeta([
        { role: 'system', content: this.prompts.getWeeklyReportPrompt() },
        {
          role: 'user',
          content: `恋爱天数：${couple?.bindTime ? '已绑定情侣' : '未绑定'}\n日记篇数：${diaryCount}\n内容：\n${diaryText}`,
        },
      ]);
      if (reportResult.content && !reportResult.busy && !reportResult.timeout) {
        weeklyNarrative = reportResult.content;
      }
    }

    const communicationScore = analysis.communication ?? 70;
    const intimacyScore = analysis.companionship ?? analysis.understanding ?? 75;
    const ritualScore = analysis.ritual ?? 65;
    const emotionScore = analysis.emotionStability ?? analysis.security ?? 72;
    const totalScore = Math.round(
      (communicationScore + intimacyScore + ritualScore + emotionScore) / 4,
    );

    const summary =
      analysis.summary ||
      weeklyNarrative.slice(0, 500) ||
      `本周你记录了 ${diaryCount} 篇日记。恋恋感受到你在用心记录这段感情。`;
    const suggestion =
      analysis.suggestion ||
      '可以尝试每周安排一次「无手机约会」，专注陪伴对方。';

    const report = this.reportRepo.create({
      userId,
      coupleId: couple?.id || null,
      reportType: 1,
      emotionScore,
      intimacyScore,
      communicationScore,
      ritualScore,
      totalScore,
      summary,
      suggestion,
      rawJson: { diaryCount, analysis, weeklyNarrative: weeklyNarrative.slice(0, 2000) },
    });
    await this.reportRepo.save(report);
    return { reportId: report.id };
  }

  async getReport(userId: string, id: string) {
    const report = await this.reportRepo.findOne({ where: { id, userId } });
    if (!report) throw new NotFoundException('报告不存在');
    return {
      id: report.id,
      emotionScore: report.emotionScore,
      intimacyScore: report.intimacyScore,
      communicationScore: report.communicationScore,
      totalScore: report.totalScore,
      summary: report.summary,
      suggestion: report.suggestion,
      createdAt: report.createdAt,
    };
  }

  private async generateLoverReply(
    userId: string,
    sessionId: string,
    input: string,
    diaryContext: string,
    memoryText: string,
    loveDays?: number,
  ) {
    const history = await this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    const contextBlock = this.prompts.buildLoverContextBlock({
      memoryText,
      diaryContext,
      loveDays,
      recentMood: input.includes('不开心') ? '低落' : undefined,
    });

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `${this.prompts.getLoverSystemPrompt()}${contextBlock}`,
      },
    ];

    for (const msg of history) {
      messages.push({
        role: msg.senderId === userId ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    const aiResult = await this.aiChat.completeWithMeta(messages);
    if (aiResult.content && !aiResult.busy && !aiResult.timeout) {
      void this.aiUsage.log({
        userId,
        scene: 'chat',
        promptText: input,
        completionText: aiResult.content,
      });
      return aiResult.content;
    }
    if (aiResult.message) {
      return aiResult.message;
    }

    return this.buildFallbackReply(input, diaryContext, memoryText);
  }

  private async extractMemoriesFromText(userId: string, text: string) {
    const aiResult = await this.aiChat.completeWithMeta(
      [
        { role: 'system', content: this.prompts.getMemoryExtractPrompt() },
        { role: 'user', content: text },
      ],
      { timeoutMs: 20000, maxAttempts: 1 },
    );
    if (!aiResult.content) return;

    type MemoryItem = { type?: string; content?: string; importance?: number };
    let items: MemoryItem[] = [];
    try {
      const parsed = parseAiJson<MemoryItem[] | { memories?: MemoryItem[] }>(
        aiResult.content,
      );
      items = Array.isArray(parsed) ? parsed : parsed.memories || [];
    } catch {
      return;
    }

    for (const item of items.slice(0, 3)) {
      if (!item.content?.trim()) continue;
      await this.memoryRepo.save(
        this.memoryRepo.create({
          userId,
          content: item.content.trim().slice(0, 500),
          memoryType: 2,
          sourceType: 2,
          importance: Math.min(100, Math.max(10, item.importance ?? 40)),
          status: 1,
        }),
      );
    }
  }

  private buildFallbackReply(
    input: string,
    diaryContext: string,
    memoryText: string,
  ) {
    if (diaryContext.includes('不开心') || input.includes('不开心')) {
      return memoryText
        ? `我注意到你最近日记里有一些低落时刻。${memoryText}。你愿意多说说今天具体发生了什么吗？恋恋在这里陪你。`
        : '听起来你今天不太好。愿意和我聊聊发生了什么吗？我会认真听你说。';
    }
    if (diaryContext) {
      return `根据你最近的记录，我能感受到你在用心经营这段感情。关于「${input.slice(0, 20)}」，我的看法是：先照顾好自己的情绪，再用温和的语气和对方沟通，会比指责更有效。`;
    }
    return `恋恋听到了：「${input.slice(0, 40)}」。感情里最重要的是被看见与被理解，你想先从哪一步开始改善呢？`;
  }
}
