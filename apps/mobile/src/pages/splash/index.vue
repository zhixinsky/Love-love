<template>
  <view class="splash">
    <view class="logo-wrap" :class="{ fade: fading }">
      <text class="logo">💕</text>
      <text class="brand">恋恋</text>
      <text class="slogan">记录爱情，见证成长</text>
      <view class="dots">
        <view v-for="i in 3" :key="i" class="dot" :class="{ on: dotIndex === i - 1 }" />
      </view>
    </view>
    <text class="ver">v1.0.0</text>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getToken } from '@/utils/storage';

const fading = ref(false);
const dotIndex = ref(0);
let dotTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  dotTimer = setInterval(() => {
    dotIndex.value = (dotIndex.value + 1) % 3;
  }, 400);
  setTimeout(() => {
    fading.value = true;
    setTimeout(() => {
      const url = getToken() ? '/pages/post/index' : '/pages/login/index';
      uni.reLaunch({ url });
    }, 300);
  }, 1800);
});

onUnmounted(() => {
  if (dotTimer) clearInterval(dotTimer);
});
</script>

<style lang="scss" scoped>
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, #fff5f8 0%, #ffe0ec 50%, #fff5f8 100%);
}
.logo-wrap {
  text-align: center;
  transition: opacity 0.3s;
}
.logo-wrap.fade {
  opacity: 0.6;
}
.logo {
  font-size: 128rpx;
  display: block;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
.brand {
  display: block;
  font-size: 60rpx;
  font-weight: 700;
  color: #ff6b9d;
  margin-top: 24rpx;
  letter-spacing: 8rpx;
}
.slogan {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 40rpx;
}
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ffd0e0;
}
.dot.on {
  background: #ff6b9d;
  width: 24rpx;
  border-radius: 6rpx;
}
.ver {
  position: absolute;
  bottom: 48rpx;
  font-size: 22rpx;
  color: #ccc;
}
</style>
