import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginMobileDto } from './dto/login-mobile.dto';
import { LoginWechatDto } from './dto/login-wechat.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sms/send')
  sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendSmsCode(dto.mobile);
  }

  @Public()
  @Post('login/mobile')
  loginMobile(@Body() dto: LoginMobileDto) {
    return this.authService.loginByMobile(dto.mobile, dto.code);
  }

  @Public()
  @Post('login/wechat')
  loginWechat(@Body() dto: LoginWechatDto) {
    return this.authService.loginByWechat(dto.code, dto.nickname, dto.avatar);
  }
}
