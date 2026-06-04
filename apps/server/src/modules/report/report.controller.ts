import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubmitReportDto } from './dto/submit-report.dto';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  submit(@CurrentUser('userId') userId: string, @Body() dto: SubmitReportDto) {
    return this.reportService.submit(userId, dto);
  }
}
