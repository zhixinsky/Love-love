import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { SmsService } from '../sms/sms.service';

interface CodeEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly codeStore = new Map<string, CodeEntry>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {}

  async sendSmsCode(mobile: string) {
    const existing = this.codeStore.get(mobile);
    if (existing && existing.expiresAt - Date.now() > 4.5 * 60 * 1000) {
      throw new BadRequestException('发送过于频繁，请稍后再试');
    }

    if (!this.smsService.isConfigured()) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('短信服务未配置');
      }
      const devCode = process.env.SMS_DEV_CODE || '123456';
      this.codeStore.set(mobile, {
        code: devCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return {
        success: true,
        mobile,
        message: `开发环境验证码：${devCode}`,
      };
    }

    const code = this.smsService.generateCode();
    const sent = await this.smsService.sendVerificationCode(mobile, code);
    if (!sent) {
      throw new BadRequestException('短信发送失败，请稍后重试');
    }

    this.codeStore.set(mobile, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    this.logger.log(`Verification code sent to ${mobile}`);

    return { success: true, mobile };
  }

  async loginByMobile(mobile: string, code: string) {
    const entry = this.codeStore.get(mobile);
    if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
      throw new UnauthorizedException('验证码错误或已过期');
    }
    this.codeStore.delete(mobile);

    let user = await this.userRepo.findOne({ where: { mobile } });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = this.userRepo.create({
        mobile,
        nickname: `用户${mobile.slice(-4)}`,
        status: 1,
      });
      await this.userRepo.save(user);
      this.logger.log(`New user registered: ${mobile}`);
    } else if (user.status !== 1) {
      throw new ForbiddenException('账号已被禁用，请联系客服');
    }

    return this.buildLoginResult(user, isNewUser);
  }

  async loginByWechat(code: string, nickname?: string, avatar?: string) {
    const session = await this.exchangeWechatCode(code);
    const openid = session.openid;
    if (!openid) {
      throw new UnauthorizedException('微信登录失败');
    }

    let user = await this.userRepo.findOne({ where: { openid } });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = this.userRepo.create({
        openid,
        nickname: nickname || '微信用户',
        avatar: avatar || '',
        status: 1,
      });
      await this.userRepo.save(user);
    } else if (user.status !== 1) {
      throw new ForbiddenException('账号已被禁用');
    }
    return this.buildLoginResult(user, isNewUser);
  }

  private async exchangeWechatCode(code: string) {
    const appId = process.env.WX_APPID;
    const secret = process.env.WX_APP_SECRET;
    if (!appId || !secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('微信登录未配置');
      }
      return { openid: `dev_wx_${code.slice(0, 16)}` };
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      openid?: string;
      errcode?: number;
      errmsg?: string;
    };
    if (data.errcode || !data.openid) {
      this.logger.warn(`WeChat login failed: ${data.errmsg || data.errcode}`);
      throw new UnauthorizedException('微信授权失败');
    }
    return { openid: data.openid };
  }

  private buildLoginResult(user: UserEntity, isNewUser = false) {
    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      token,
      isNewUser,
      user: {
        id: user.id,
        mobile: user.mobile,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        loveStatus: user.loveStatus,
      },
    };
  }

  validateUser(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async requireUser(userId: string) {
    const user = await this.validateUser(userId);
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }
}
