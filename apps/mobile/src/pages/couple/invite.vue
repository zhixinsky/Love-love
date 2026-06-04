<template>
  <view class="page">
    <view class="hero love-card">
      <text class="emoji">💌</text>
      <text class="t">邀请另一半</text>
      <text class="d">生成邀请码发给 TA，对方在绑定页输入即可</text>
    </view>

    <view v-if="inviteCode" class="code-box love-card">
      <text class="label">你的邀请码</text>
      <text class="code">{{ inviteCode }}</text>
      <text class="expire">有效期 7 天 · 仅可使用一次</text>
      <view class="love-btn love-btn-primary" @tap="copy">复制邀请码</view>
      <!-- #ifdef MP-WEIXIN -->
      <view class="love-btn love-btn-outline" @tap="shareHint">分享给微信好友</view>
      <!-- #endif -->
    </view>

    <view v-else class="empty-box">
      <view class="love-btn love-btn-primary" @tap="gen">生成邀请码</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createInvite } from '@/api/couple';

const inviteCode = ref('');

async function gen() {
  const res = await createInvite();
  inviteCode.value = res.inviteCode;
  uni.showToast({ title: '已生成', icon: 'success' });
}

function copy() {
  uni.setClipboardData({
    data: `我在恋恋等你～邀请码：${inviteCode.value}`,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
  });
}

function shareHint() {
  uni.showToast({
    title: '请粘贴邀请码发送给 TA',
    icon: 'none',
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 32rpx;
  background: $love-bg;
  min-height: 100vh;
}
.hero {
  text-align: center;
  padding: 40rpx;
  margin-bottom: 32rpx;
}
.emoji {
  font-size: 72rpx;
  display: block;
}
.hero .t {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
  margin-top: 12rpx;
}
.hero .d {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
  line-height: 1.5;
}
.code-box {
  padding: 40rpx;
  text-align: center;
}
.label {
  font-size: 26rpx;
  color: $love-text-muted;
  display: block;
}
.code {
  font-size: 56rpx;
  font-weight: 700;
  color: $love-primary;
  letter-spacing: 12rpx;
  margin: 24rpx 0;
  display: block;
}
.expire {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-bottom: 32rpx;
  display: block;
}
.love-btn {
  margin-top: 16rpx;
}
</style>
