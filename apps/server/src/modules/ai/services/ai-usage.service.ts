import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsageLogEntity } from '../../../entities/ai-usage-log.entity';

@Injectable()
export class AiUsageService {
  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly logRepo: Repository<AiUsageLogEntity>,
  ) {}

  async log(params: {
    userId: string;
    scene: string;
    model?: string;
    promptText?: string;
    completionText?: string;
  }) {
    const promptTokens = Math.ceil((params.promptText?.length || 0) / 4);
    const completionTokens = Math.ceil((params.completionText?.length || 0) / 4);
    const total = promptTokens + completionTokens;
    await this.logRepo.save(
      this.logRepo.create({
        userId: params.userId,
        scene: params.scene,
        model: params.model || process.env.OPENAI_MODEL || 'unknown',
        promptTokens,
        completionTokens,
        totalTokens: total,
        cost: String((total / 1000) * 0.01),
      }),
    );
  }
}
