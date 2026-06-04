<template>
  <view class="page">
    <view
      v-for="p in plans"
      :key="p.code"
      class="plan love-card"
      :class="{ on: sel === p.code }"
      @tap="sel = p.code"
    >
      <text class="name">{{ p.name }}</text>
      <text class="price">¥{{ p.price }}</text>
      <text class="days">{{ p.days }} 天</text>
    </view>
    <view class="love-btn love-btn-primary" @tap="buy">
      {{ paying ? '处理中...' : '立即开通' }}
    </view>
    <text class="hint">{{ hint }}</text>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  createVipOrder,
  getVipPlans,
  payVipOrder,
  type VipPlan,
} from '@/api/vip';
import { requestWechatPay } from '@/utils/wechat-pay';

const plans = ref<VipPlan[]>([]);
const sel = ref('monthly');
const paying = ref(false);
const hint = ref('未配置微信支付时将使用模拟支付');

onMounted(async () => {
  const res = await getVipPlans();
  plans.value = (res.list || []).filter((p) => p.vipType === 1);
  if (plans.value.length) sel.value = plans.value[0].code;
});

async function buy() {
  paying.value = true;
  try {
    const order = await createVipOrder(sel.value);
    hint.value = order.payChannelHint || hint.value;

    if (order.payMode === 'wechat' && order.wxPay) {
      await requestWechatPay(order.wxPay);
      await payVipOrder(order.orderNo, 2);
    } else {
      await payVipOrder(order.orderNo, 1);
    }

    uni.showToast({ title: '开通成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '支付失败',
      icon: 'none',
    });
  } finally {
    paying.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.plan {
  padding: 32rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
}
.plan.on {
  border-color: $love-primary;
}
.name {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.price {
  color: $love-primary;
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 8rpx;
  display: block;
}
.days {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 4rpx;
  display: block;
}
.hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 24rpx;
}
</style>
