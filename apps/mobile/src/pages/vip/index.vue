<template>
  <view class="page">
    <view v-if="vipInfo?.active" class="status love-card">
      <text class="badge">VIP</text>
      <text class="t">{{ vipInfo.vip?.vipType === 2 ? '情侣会员' : '个人会员' }}生效中</text>
      <text class="s">有效期至 {{ formatDate(vipInfo.vip?.endTime) }}</text>
    </view>

    <view class="hero">
      <text class="logo">👑</text>
      <text class="t">恋恋 VIP</text>
      <text class="s">解锁更深度的 AI 陪伴与情侣特权</text>
    </view>

    <view class="benefits">
      <view v-for="b in benefits" :key="b.title" class="b love-card">
        <text class="icon">{{ b.icon }}</text>
        <view>
          <text class="bt">{{ b.title }}</text>
          <text class="bd">{{ b.desc }}</text>
        </view>
      </view>
    </view>

    <view class="love-btn love-btn-primary" @tap="go('/pages/vip/purchase')">开通个人会员</view>
    <view class="love-btn love-btn-outline" @tap="go('/pages/vip/couple')">开通情侣会员</view>
    <text class="hint">支付功能可在设置中查看开通记录</text>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getMyVip } from '@/api/vip';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();
const vipInfo = ref<{ active: boolean; vip?: { vipType?: number; endTime?: string } } | null>(
  null,
);

const benefits = [
  { icon: '🤖', title: 'AI 无限畅聊', desc: '更高频次情感对话与记忆' },
  { icon: '📊', title: '恋爱周报', desc: '每周幸福指数与改善建议' },
  { icon: '💑', title: '情侣分析', desc: '双人关系深度报告（情侣会员）' },
  { icon: '🎁', title: '专属标识', desc: '昵称旁 VIP 徽章与优先推荐' },
];

onShow(async () => {
  if (!checkLogin()) return;
  vipInfo.value = await getMyVip();
});

function formatDate(v?: string) {
  if (!v) return '';
  return String(v).slice(0, 10);
}
function go(url: string) {
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  padding-bottom: 48rpx;
  background: linear-gradient(180deg, #fff8e6, $love-bg 35%);
  min-height: 100vh;
}
.status {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, #ffe8a0, #fff5d6);
}
.badge {
  font-size: 22rpx;
  background: #d4a017;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 8rpx;
}
.hero {
  text-align: center;
  padding: 32rpx 0;
}
.logo {
  font-size: 80rpx;
  display: block;
}
.hero .t {
  font-size: 44rpx;
  font-weight: 700;
  color: #d4a017;
  display: block;
  margin-top: 12rpx;
}
.hero .s {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.benefits {
  margin-bottom: 32rpx;
}
.b {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}
.bt {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.bd {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 20rpx;
}
.love-btn {
  margin-top: 16rpx;
}
</style>
