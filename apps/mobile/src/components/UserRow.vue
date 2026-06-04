<template>
  <view class="user-row love-card" @tap="$emit('tap')">
    <image :src="avatar || '/static/default-avatar.png'" class="av" mode="aspectFill" />
    <view class="body">
      <text class="name">{{ nickname || '用户' }}</text>
      <text v-if="sub" class="sub">{{ sub }}</text>
    </view>
    <slot name="trail" />
    <text v-if="showArrow" class="arr">›</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  nickname?: string;
  avatar?: string;
  sub?: string;
  showArrow?: boolean;
}>();

defineEmits<{ tap: [] }>();
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.user-row {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.av {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.body {
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 30rpx;
  font-weight: 600;
  color: $love-text;
  display: block;
}
.sub {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.arr {
  font-size: 32rpx;
  color: $love-text-muted;
  margin-left: 8rpx;
}
</style>
