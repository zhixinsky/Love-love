import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';
import { OrderEntity } from '../../entities/order.entity';
import { UserEntity } from '../../entities/user.entity';
import { VipUserEntity } from '../../entities/vip-user.entity';
import { WechatPayService } from './wechat-pay.service';

const PLANS = [
  { id: 1, code: 'monthly', name: '月度会员', price: 18, days: 30, vipType: 1 },
  { id: 2, code: 'yearly', name: '年度会员', price: 128, days: 365, vipType: 1 },
  {
    id: 3,
    code: 'couple_yearly',
    name: '情侣年度会员',
    price: 198,
    days: 365,
    vipType: 2,
  },
];

@Injectable()
export class VipService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(VipUserEntity)
    private readonly vipRepo: Repository<VipUserEntity>,
    @InjectRepository(CoupleEntity)
    private readonly coupleRepo: Repository<CoupleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly wechatPay: WechatPayService,
  ) {}

  getPlans() {
    return { list: PLANS };
  }

  async getMyVip(userId: string) {
    const vip = await this.vipRepo.findOne({
      where: { userId, status: 1 },
      order: { endTime: 'DESC' },
    });
    if (!vip || new Date(vip.endTime) < new Date()) {
      return { active: false, vip: null };
    }
    return {
      active: true,
      vip: {
        vipType: vip.vipType,
        startTime: vip.startTime,
        endTime: vip.endTime,
      },
    };
  }

  async createOrder(userId: string, planCode: string) {
    const plan = PLANS.find((p) => p.code === planCode);
    if (!plan) throw new BadRequestException('套餐不存在');

    if (plan.vipType === 2) {
      const couple = await this.coupleRepo.findOne({
        where: [
          { userId, status: 1 },
          { partnerId: userId, status: 1 },
        ],
      });
      if (!couple) {
        throw new BadRequestException('开通情侣会员需先绑定情侣');
      }
    }

    const orderNo = `LV${Date.now()}${randomBytes(3).toString('hex')}`;
    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNo,
        userId,
        productType: 1,
        productId: String(plan.id),
        amount: String(plan.price),
        payStatus: 0,
      }),
    );

    const user = await this.userRepo.findOne({ where: { id: userId } });
    let payMode: 'mock' | 'wechat' = 'mock';
    let wxPay: Awaited<
      ReturnType<WechatPayService['createMiniProgramPay']>
    > = null;

    if (this.wechatPay.isConfigured() && user?.openid) {
      wxPay = await this.wechatPay.createMiniProgramPay(
        order.orderNo,
        plan.name,
        plan.price,
        user.openid,
      );
      if (wxPay) payMode = 'wechat';
    }

    return {
      orderNo: order.orderNo,
      amount: plan.price,
      planName: plan.name,
      payMode,
      wxPay,
      payChannelHint:
        payMode === 'wechat'
          ? '请在微信小程序内完成支付'
          : '未配置微信支付或缺少 openid，可调用模拟支付接口',
    };
  }

  async handleWechatNotify(xml: string) {
    const params = this.wechatPay.parseNotifyXml(xml);
    if (
      params.return_code !== 'SUCCESS' ||
      params.result_code !== 'SUCCESS' ||
      !this.wechatPay.verifyNotifySign(params)
    ) {
      return { xml: '<xml><return_code><![CDATA[FAIL]]></return_code></xml>' };
    }

    const order = await this.orderRepo.findOne({
      where: { orderNo: params.out_trade_no },
    });
    if (order && order.payStatus !== 1) {
      await this.confirmPay(order.userId, order.orderNo, 2);
    }

    return {
      xml: '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
    };
  }

  async confirmPay(userId: string, orderNo: string, payChannel = 1) {
    const order = await this.orderRepo.findOne({ where: { orderNo, userId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.payStatus === 1) {
      return { success: true, message: '订单已支付' };
    }

    const plan = PLANS.find((p) => p.id === Number(order.productId));
    if (!plan) throw new BadRequestException('套餐数据异常');

    order.payStatus = 1;
    order.payChannel = payChannel;
    order.payTime = new Date();
    await this.orderRepo.save(order);

    const now = new Date();
    const existing = await this.vipRepo.findOne({
      where: { userId, status: 1 },
      order: { endTime: 'DESC' },
    });
    const start =
      existing && new Date(existing.endTime) > now
        ? new Date(existing.endTime)
        : now;
    const end = new Date(start.getTime() + plan.days * 24 * 3600 * 1000);

    if (existing && new Date(existing.endTime) > now) {
      existing.endTime = end;
      existing.vipType = plan.vipType;
      await this.vipRepo.save(existing);
    } else {
      await this.vipRepo.save(
        this.vipRepo.create({
          userId,
          vipType: plan.vipType,
          startTime: now,
          endTime: end,
          status: 1,
        }),
      );
    }

    return {
      success: true,
      vipType: plan.vipType,
      endTime: end,
    };
  }
}
