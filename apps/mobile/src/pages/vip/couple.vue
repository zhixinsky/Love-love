<template>
  <view class="page">
    <text class="tip">情侣会员需双方已绑定，开通后双方共享 VIP 权益（以开通者账号为准）。</text>
    <view
      v-for="p in plans"
      :key="p.code"
      class="plan love-card"
      :class="{ on: sel === p.code }"
      @tap="sel = p.code"
    >
      <text class="name">{{ p.name }}</text>
      <text class="price">¥{{ p.price }} / {{ p.days }}天</text>
    </view>
    <view class="love-btn love-btn-primary" @tap="buy">
      {{ paying ? '处理中...' : '开通情侣会员' }}
    </view>
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
const sel = ref('couple_yearly');
const paying = ref(false);

onMounted(async () => {
  const res = await getVipPlans();
  plans.value = (res.list || []).filter((p) => p.vipType === 2);
});

async function buy() {
  paying.value = true;
  try {
    const order = await createVipOrder(sel.value);
    if (order.payMode === 'wechat' && order.wxPay) {
      await requestWechatPay(order.wxPay);
      await payVipOrder(order.orderNo, 2);
    } else {
      await payVipOrder(order.orderNo, 1);
    }
    uni.showToast({ title: '情侣会员已开通', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '开通失败',
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
  padding: 32rpx 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.tip {
  color: $love-text-muted;
  font-size: 28rpx;
  line-height: 1.6;
  display: block;
  margin-bottom: 32rpx;
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
  font-size: 36rpx;
  margin-top: 8rpx;
  display: block;
}
</style>
