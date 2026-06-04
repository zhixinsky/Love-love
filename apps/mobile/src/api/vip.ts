import { http } from '@/utils/request';

export function getVipPlans() {
  return http.get<{ list: VipPlan[] }>('/vip/plans');
}

export interface VipInfo {
  vipType?: number;
  endTime?: string;
  startTime?: string;
}

export function getMyVip() {
  return http.get<{ active: boolean; vip?: VipInfo }>('/vip/mine');
}

export interface WxPayParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'MD5';
  paySign: string;
}

export function createVipOrder(planCode: string) {
  return http.post<{
    orderNo: string;
    amount: number;
    planName: string;
    payMode?: 'mock' | 'wechat';
    wxPay?: WxPayParams | null;
    payChannelHint?: string;
  }>('/vip/order', { planCode });
}

export function payVipOrder(orderNo: string, payChannel = 1) {
  return http.post<{ success: boolean; endTime?: string }>(
    `/vip/order/${orderNo}/pay`,
    { payChannel },
  );
}

export interface VipPlan {
  id: number;
  code: string;
  name: string;
  price: number;
  days: number;
  vipType: number;
}
