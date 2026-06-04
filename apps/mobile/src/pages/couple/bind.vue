<template>
  <view class="page">
    <view class="hero love-card">
      <text class="emoji">💑</text>
      <text class="t">绑定另一半</text>
      <text class="d">输入 TA 发来的 6 位邀请码，开启情侣空间</text>
    </view>

    <view class="steps">
      <view class="step"><text class="n">1</text><text>让 TA 在「邀请对象」页生成邀请码</text></view>
      <view class="step"><text class="n">2</text><text>将邀请码发给你</text></view>
      <view class="step"><text class="n">3</text><text>在此输入并确认绑定</text></view>
    </view>

    <input
      v-model="code"
      class="love-input code-inp"
      placeholder="请输入邀请码"
      maxlength="12"
    />
    <view class="love-btn love-btn-primary" @tap="bind">确认绑定</view>
    <view class="link" @tap="goInvite">还没有邀请码？去生成我的 →</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { bindCouple } from '@/api/couple';

const code = ref('');

async function bind() {
  if (!code.value.trim()) {
    uni.showToast({ title: '请输入邀请码', icon: 'none' });
    return;
  }
  try {
    await bindCouple(code.value.trim());
    uni.showToast({ title: '绑定成功 🎉', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/me/index' }), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '绑定失败',
      icon: 'none',
    });
  }
}

function goInvite() {
  uni.navigateTo({ url: '/pages/couple/invite' });
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
  margin-top: 12rpx;
  display: block;
}
.hero .d {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
}
.steps {
  margin-bottom: 32rpx;
}
.step {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: $love-text-muted;
}
.n {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: $love-primary;
  color: #fff;
  border-radius: 50%;
  margin-right: 16rpx;
  font-size: 24rpx;
}
.code-inp {
  text-align: center;
  font-size: 40rpx;
  letter-spacing: 8rpx;
  font-weight: 600;
}
.link {
  text-align: center;
  margin-top: 32rpx;
  color: $love-primary;
  font-size: 28rpx;
}
</style>
