import { Injectable } from '@nestjs/common';
import {
  AI_LOVER_SYSTEM,
  AI_MEMORY_EXTRACT_SYSTEM,
  AI_RISK_SYSTEM,
  AI_WEEKLY_ANALYSIS_SYSTEM,
  AI_WEEKLY_REPORT_SYSTEM,
} from './ai-prompts';

@Injectable()
export class AiPromptService {
  getLoverSystemPrompt() {
    return AI_LOVER_SYSTEM;
  }

  buildLoverContextBlock(options: {
    memoryText?: string;
    diaryContext?: string;
    loveDays?: number;
    recentEvents?: string;
    recentMood?: string;
  }) {
    const lines: string[] = [];
    if (options.memoryText) lines.push(`用户背景记忆：\n${options.memoryText}`);
    if (options.loveDays) lines.push(`恋爱天数：${options.loveDays}天`);
    if (options.recentEvents) lines.push(`最近事件：\n${options.recentEvents}`);
    if (options.recentMood) lines.push(`最近情绪：${options.recentMood}`);
    if (options.diaryContext) lines.push(`近期日记摘录：\n${options.diaryContext}`);
    if (!lines.length) return '';
    return `\n\n---\n${lines.join('\n\n')}`;
  }

  getMemoryExtractPrompt() {
    return AI_MEMORY_EXTRACT_SYSTEM;
  }

  getWeeklyAnalysisPrompt() {
    return AI_WEEKLY_ANALYSIS_SYSTEM;
  }

  getWeeklyReportPrompt() {
    return AI_WEEKLY_REPORT_SYSTEM;
  }

  getRiskPrompt() {
    return AI_RISK_SYSTEM;
  }
}
