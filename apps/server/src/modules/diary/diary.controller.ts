import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { DiaryService } from './diary.service';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateDiaryDto) {
    return this.diaryService.create(userId, dto);
  }

  @Get('list')
  list(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
    @Query('visibility') visibility?: string,
  ) {
    return this.diaryService.list(
      userId,
      q.page,
      q.pageSize,
      visibility ? Number(visibility) : undefined,
    );
  }

  @Get(':id')
  detail(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.diaryService.detail(userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDiaryDto,
  ) {
    return this.diaryService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.diaryService.remove(userId, id);
  }
}
