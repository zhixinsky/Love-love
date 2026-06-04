import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BindCoupleDto } from './dto/bind-couple.dto';
import { InviteCoupleDto } from './dto/invite-couple.dto';
import { CoupleService } from './couple.service';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('invite')
  invite(@CurrentUser('userId') userId: string, @Body() dto: InviteCoupleDto) {
    return this.coupleService.invite(userId, dto.loveStartDate);
  }

  @Post('bind')
  bind(@CurrentUser('userId') userId: string, @Body() dto: BindCoupleDto) {
    return this.coupleService.bind(userId, dto.inviteCode);
  }

  @Get('info')
  info(@CurrentUser('userId') userId: string) {
    return this.coupleService.info(userId);
  }

  @Post('unbind')
  unbind(@CurrentUser('userId') userId: string) {
    return this.coupleService.unbind(userId);
  }
}
