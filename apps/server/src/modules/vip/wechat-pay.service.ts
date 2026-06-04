import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

export interface WxMiniPayParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'MD5';
  paySign: string;
}

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get('WX_APPID') &&
        this.config.get('WX_MCH_ID') &&
        this.config.get('WX_MCH_API_KEY') &&
        this.config.get('WX_PAY_NOTIFY_URL'),
    );
  }

  /** 微信小程序 JSAPI 预支付参数；未配置商户号时返回 null */
  async createMiniProgramPay(
    orderNo: string,
    description: string,
    amountYuan: number,
    openid: string,
  ): Promise<WxMiniPayParams | null> {
    if (!this.isConfigured() || !openid) return null;

    const appid = this.config.get<string>('WX_APPID')!;
    const mchId = this.config.get<string>('WX_MCH_ID')!;
    const apiKey = this.config.get<string>('WX_MCH_API_KEY')!;
    const notifyUrl = this.config.get<string>('WX_PAY_NOTIFY_URL')!;

    const unified: Record<string, string> = {
      appid,
      mch_id: mchId,
      nonce_str: randomBytes(8).toString('hex'),
      body: description.slice(0, 32),
      out_trade_no: orderNo,
      total_fee: String(Math.round(amountYuan * 100)),
      spbill_create_ip: '127.0.0.1',
      notify_url: notifyUrl,
      trade_type: 'JSAPI',
      openid,
    };
    unified.sign = this.signMd5(unified, apiKey);

    try {
      const xml = this.toXml(unified);
      const res = await fetch(
        'https://api.mch.weixin.qq.com/pay/unifiedorder',
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/xml' },
          body: xml,
        },
      );
      const text = await res.text();
      const prepayId = this.parseXmlField(text, 'prepay_id');
      const returnCode = this.parseXmlField(text, 'return_code');
      const resultCode = this.parseXmlField(text, 'result_code');
      if (returnCode !== 'SUCCESS' || resultCode !== 'SUCCESS' || !prepayId) {
        this.logger.warn(`unifiedorder failed: ${text.slice(0, 300)}`);
        return null;
      }

      const timeStamp = String(Math.floor(Date.now() / 1000));
      const nonceStr = randomBytes(8).toString('hex');
      const pkg = `prepay_id=${prepayId}`;
      const paySign = this.signMd5(
        {
          appId: appid,
          timeStamp,
          nonceStr,
          package: pkg,
          signType: 'MD5',
        },
        apiKey,
      );

      return {
        timeStamp,
        nonceStr,
        package: pkg,
        signType: 'MD5',
        paySign,
      };
    } catch (err) {
      this.logger.error('WeChat unifiedorder error', err);
      return null;
    }
  }

  verifyNotifySign(params: Record<string, string>): boolean {
    const apiKey = this.config.get<string>('WX_MCH_API_KEY');
    if (!apiKey) return false;
    const sign = params.sign;
    if (!sign) return false;
    const copy = { ...params };
    delete copy.sign;
    return this.signMd5(copy, apiKey) === sign;
  }

  parseNotifyXml(xml: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>([^<]*)<\/\3>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const key = m[1] || m[3];
      const val = m[2] ?? m[4];
      if (key) result[key] = val;
    }
    return result;
  }

  private signMd5(params: Record<string, string>, apiKey: string): string {
    const sorted = Object.keys(params)
      .filter((k) => k !== 'sign' && params[k] !== '' && params[k] != null)
      .sort();
    const str =
      sorted.map((k) => `${k}=${params[k]}`).join('&') + `&key=${apiKey}`;
    return createHash('md5').update(str).digest('hex').toUpperCase();
  }

  private toXml(obj: Record<string, string>): string {
    const inner = Object.entries(obj)
      .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
      .join('');
    return `<xml>${inner}</xml>`;
  }

  private parseXmlField(xml: string, field: string): string {
    const cdata = new RegExp(
      `<${field}><!\\[CDATA\\[(.*?)\\]\\]></${field}>`,
    ).exec(xml);
    if (cdata) return cdata[1];
    const plain = new RegExp(`<${field}>([^<]*)</${field}>`).exec(xml);
    return plain?.[1] || '';
  }
}
