import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BottleService } from './bottle.service';
import { ReplyBottleDto } from './dto/reply-bottle.dto';
import { ThrowBottleDto } from './dto/throw-bottle.dto';

@Controller('bottle')
export class BottleController {
  constructor(private readonly bottleService: BottleService) {}

  @Post()
  throwBottle(
    @CurrentUser('userId') userId: string,
    @Body() dto: ThrowBottleDto,
  ) {
    return this.bottleService.throwBottle(userId, dto);
  }

  @Get('my/list')
  myList(@CurrentUser('userId') userId: string) {
    return this.bottleService.myBottles(userId);
  }

  @Get(':id')
  detail(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.bottleService.getDetail(userId, id);
  }

  @Post('pick')
  pick(@CurrentUser('userId') userId: string, @Query('city') city?: string) {
    return this.bottleService.pick(userId, city);
  }

  @Post('reply')
  reply(@CurrentUser('userId') userId: string, @Body() dto: ReplyBottleDto) {
    return this.bottleService.reply(userId, String(dto.bottleId), dto.content);
  }
}
