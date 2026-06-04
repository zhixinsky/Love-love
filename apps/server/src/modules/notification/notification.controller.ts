import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('list')
  list(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
    @Query('type') type?: string,
  ) {
    return this.notificationService.list(
      userId,
      q.page,
      q.pageSize,
      type ? Number(type) : undefined,
    );
  }

  @Post('read')
  markRead(@CurrentUser('userId') userId: string, @Body() dto: MarkReadDto) {
    return this.notificationService.markRead(userId, dto.ids);
  }
}
