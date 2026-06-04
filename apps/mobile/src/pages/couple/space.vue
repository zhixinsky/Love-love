<template>
  <view class="page">
    <view v-if="info?.bound" class="hero love-card">
      <view class="avatars">
        <image
          v-if="info.partner?.avatar"
          :src="info.partner.avatar"
          class="partner-av"
          mode="aspectFill"
        />
      </view>
      <text class="days">{{ info.loveDays }}</text>
      <text class="days-label">天</text>
      <text class="p">与 {{ info.partner?.nickname || 'TA' }} 的恋爱空间</text>
    </view>
    <view v-else class="empty love-card">
      <text class="empty-t">还没有绑定情侣</text>
      <text class="empty-d">绑定后可共享日记、愿望与纪念日</text>
      <view class="love-btn love-btn-primary" @tap="goBind">邀请另一半</view>
    </view>

    <view class="grid">
      <view
        v-for="m in menus"
        :key="m.path"
        class="cell love-card"
        @tap="go(m.path)"
      >
        <text class="icon">{{ m.icon }}</text>
        <text class="label">{{ m.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getCoupleInfo } from '@/api/couple';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();
const info = ref<any>(null);

const menus = [
  { icon: '📔', label: '共同日记', path: '/pages/diary/index' },
  { icon: '⭐', label: '愿望清单', path: '/pages/wish/index' },
  { icon: '📅', label: '纪念日', path: '/pages/anniversary/index' },
  { icon: '📍', label: '时间轴', path: '/pages/couple/timeline' },
  { icon: '🖼', label: '共同相册', path: '/pages/couple/album' },
];

onShow(async () => {
  if (!checkLogin()) return;
  info.value = await getCoupleInfo();
});

function go(url: string) {
  uni.navigateTo({ url });
}
function goBind() {
  uni.navigateTo({ url: '/pages/couple/bind' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.hero {
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  color: #fff;
  text-align: center;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
}
.partner-av {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.85);
}
.days {
  font-size: 80rpx;
  font-weight: 700;
  display: inline;
  line-height: 1;
}
.days-label {
  font-size: 32rpx;
  margin-left: 8rpx;
}
.p {
  margin-top: 16rpx;
  opacity: 0.95;
  font-size: 28rpx;
  display: block;
}
.empty {
  text-align: center;
  padding: 48rpx;
  margin-bottom: 24rpx;
}
.empty-t {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.empty-d {
  font-size: 26rpx;
  color: $love-text-muted;
  margin: 12rpx 0 24rpx;
  display: block;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.cell {
  width: calc(50% - 8rpx);
  text-align: center;
  padding: 32rpx 16rpx;
  box-sizing: border-box;
}
.icon {
  font-size: 48rpx;
  display: block;
}
.label {
  font-size: 26rpx;
  margin-top: 12rpx;
  display: block;
}
</style>
