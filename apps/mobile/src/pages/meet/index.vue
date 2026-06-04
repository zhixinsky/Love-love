<template>
  <view class="meet-page">
    <view class="banner love-card">
      <text class="banner-emoji">✨</text>
      <text class="banner-title">遇见</text>
      <text class="banner-sub">发现缘分，从这里开始</text>
    </view>

    <view
      v-for="item in entries"
      :key="item.path"
      class="entry love-card"
      @tap="go(item.path)"
    >
      <view class="icon-wrap" :style="{ background: item.bg }">
        <text class="entry-icon">{{ item.icon }}</text>
      </view>
      <view class="entry-body">
        <text class="entry-title">{{ item.title }}</text>
        <text class="entry-sub">{{ item.sub }}</text>
      </view>
      <text class="arrow">›</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();

const entries = [
  {
    icon: '🍾',
    title: '漂流瓶',
    sub: '捞一个心事 / 扔一个祝福',
    path: '/pages/bottle/index',
    bg: '#e8f4ff',
  },
  {
    icon: '📍',
    title: '附近的人',
    sub: '按距离发现身边的 TA',
    path: '/pages/meet/nearby',
    bg: '#fff5e6',
  },
  {
    icon: '✨',
    title: '灵魂匹配',
    sub: '契合度算法推荐',
    path: '/pages/meet/soul',
    bg: '#f3e8ff',
  },
];

onShow(() => checkLogin());

function go(path: string) {
  uni.navigateTo({ url: path });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.meet-page {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
  background: $love-bg;
}
.banner {
  text-align: center;
  padding: 40rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #fff5f8, #ffe8f0);
}
.banner-emoji {
  font-size: 56rpx;
  display: block;
}
.banner-title {
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 8rpx;
  display: block;
}
.banner-sub {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.entry {
  display: flex;
  align-items: center;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}
.entry-icon {
  font-size: 48rpx;
}
.entry-body {
  flex: 1;
}
.entry-title {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.entry-sub {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.arrow {
  font-size: 36rpx;
  color: $love-text-muted;
}
.coming {
  padding: 28rpx;
  opacity: 0.85;
}
.c-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.c-sub {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
</style>
