<template>
  <view class="publish-page">
    <text class="title">选择发布类型</text>
    <view
      v-for="item in types"
      :key="item.path"
      class="type-card love-card"
      @tap="go(item.path)"
    >
      <text class="type-icon">{{ item.icon }}</text>
      <view>
        <text class="type-name">{{ item.name }}</text>
        <text class="type-desc">{{ item.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();

const types = [
  { icon: '📝', name: '发动态', desc: '分享到恋爱广场', path: '/pages/post/publish' },
  { icon: '📔', name: '写日记', desc: '记录心动瞬间', path: '/pages/diary/edit' },
  { icon: '🍾', name: '发漂流瓶', desc: '匿名倾诉与交友', path: '/pages/bottle/throw' },
];

onShow(() => checkLogin());

function go(path: string) {
  uni.navigateTo({ url: path });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.publish-page {
  min-height: 100vh;
  padding: 48rpx 32rpx 120rpx;
  background: $love-bg;
}
.title {
  font-size: 36rpx;
  font-weight: 600;
  color: $love-text;
  margin-bottom: 40rpx;
  display: block;
}
.type-card {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
}
.type-icon {
  font-size: 56rpx;
  margin-right: 28rpx;
}
.type-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $love-text;
  display: block;
}
.type-desc {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
}
</style>
