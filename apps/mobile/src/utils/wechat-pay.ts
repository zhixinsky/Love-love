import type { WxPayParams } from '@/api/vip';

/** 小程序 / H5 微信支付参数（跨端类型声明不一致时用断言） */
export function requestWechatPay(wxPay: WxPayParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      provider: 'wxpay' as const,
      timeStamp: wxPay.timeStamp,
      nonceStr: wxPay.nonceStr,
      package: wxPay.package,
      signType: wxPay.signType,
      paySign: wxPay.paySign,
      success: () => resolve(),
      fail: (err: UniApp.GeneralCallbackResult) =>
        reject(new Error(err.errMsg || '支付取消')),
    };
    uni.requestPayment(
      options as unknown as UniApp.RequestPaymentOptions,
    );
  });
}
