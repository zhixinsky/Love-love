import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../../entities/report.entity';
import { SubmitReportDto } from './dto/submit-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly repo: Repository<ReportEntity>,
  ) {}

  async submit(userId: string, dto: SubmitReportDto) {
    const exists = await this.repo.findOne({
      where: {
        userId,
        targetType: dto.targetType,
        targetId: String(dto.targetId),
        status: 0,
      },
    });
    if (exists) throw new BadRequestException('已提交过举报');
    const row = this.repo.create({
      userId,
      targetType: dto.targetType,
      targetId: String(dto.targetId),
      reasonType: dto.reasonType,
      reason: dto.reason,
      status: 0,
    });
    await this.repo.save(row);
    return { success: true, reportId: row.id };
  }
}
