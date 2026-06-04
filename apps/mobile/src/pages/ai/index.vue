<template>
  <view class="ai-page">
    <view class="hero love-card">
      <text class="hero-emoji">🤖💕</text>
      <text class="hero-title">AI 恋人</text>
      <text class="hero-sub">懂你的陪伴，读得懂你的日记</text>
    </view>

    <view
      v-for="item in menus"
      :key="item.path"
      class="menu-item love-card"
      @tap="go(item.path)"
    >
      <text class="menu-icon">{{ item.icon }}</text>
      <view class="menu-body">
        <text class="menu-title">{{ item.title }}</text>
        <text class="menu-desc">{{ item.desc }}</text>
      </view>
      <text class="arrow">›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();

const menus = [
  { icon: '💬', title: 'AI 聊天', desc: '随时倾诉与陪伴', path: '/pages/ai/chat' },
  { icon: '📊', title: '恋爱分析', desc: '读懂关系温度', path: '/pages/ai/analysis' },
  { icon: '📅', title: '恋爱周报', desc: '每周幸福报告', path: '/pages/ai/report' },
  { icon: '💾', title: '爱情档案', desc: 'AI 长期记忆', path: '/pages/ai/memory' },
];

onShow(() => checkLogin());

function go(path: string) {
  uni.navigateTo({ url: path });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.ai-page {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
  background: $love-bg;
}
.hero {
  text-align: center;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #fff5f8, #ffe8f0);
}
.hero-emoji {
  font-size: 80rpx;
}
.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $love-primary;
  margin-top: 16rpx;
}
.hero-sub {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin-bottom: 20rpx;
}
.menu-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}
.menu-body {
  flex: 1;
}
.menu-title {
  font-size: 30rpx;
  font-weight: 600;
}
.menu-desc {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 4rpx;
  display: block;
}
.arrow {
  color: $love-text-muted;
  font-size: 36rpx;
}
</style>
