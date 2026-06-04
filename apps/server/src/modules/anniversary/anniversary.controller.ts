import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnniversaryService } from './anniversary.service';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';

@Controller('anniversary')
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAnniversaryDto,
  ) {
    return this.anniversaryService.create(userId, dto);
  }

  @Get('list')
  list(@CurrentUser('userId') userId: string) {
    return this.anniversaryService.list(userId);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.anniversaryService.remove(userId, id);
  }
}
