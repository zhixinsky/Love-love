import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { VipService } from './vip.service';

@Controller('vip')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Get('plans')
  plans() {
    return this.vipService.getPlans();
  }

  @Get('mine')
  mine(@CurrentUser('userId') userId: string) {
    return this.vipService.getMyVip(userId);
  }

  @Post('order')
  createOrder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.vipService.createOrder(userId, dto.planCode);
  }

  @Post('order/:orderNo/pay')
  pay(
    @CurrentUser('userId') userId: string,
    @Param('orderNo') orderNo: string,
    @Body() dto: PayOrderDto,
  ) {
    return this.vipService.confirmPay(userId, orderNo, dto.payChannel ?? 1);
  }

  @Public()
  @Post('wechat/notify')
  async wechatNotify(@Req() req: Request, @Res() res: Response) {
    const raw = typeof req.body === 'string' ? req.body : '';
    const result = await this.vipService.handleWechatNotify(raw);
    res.type('text/xml').send(result.xml);
  }
}
