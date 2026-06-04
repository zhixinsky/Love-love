<template>
  <view class="item love-card" :class="{ unread: !item.isRead }" @tap="$emit('tap')">
    <view class="icon-wrap">{{ icon }}</view>
    <view class="body">
      <text class="t">{{ item.title }}</text>
      <text class="c">{{ item.content }}</text>
      <text class="time">{{ formatRelative(item.createdAt) }}</text>
    </view>
    <view v-if="!item.isRead" class="dot" />
  </view>
</template>

<script setup lang="ts">
import { formatRelative } from '@/utils/format';

defineProps<{
  item: {
    title?: string;
    content?: string;
    createdAt?: string;
    isRead?: number;
  };
  icon?: string;
}>();

defineEmits<{ tap: [] }>();
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.item.unread {
  border-left: 6rpx solid $love-primary;
}
.icon-wrap {
  font-size: 40rpx;
  margin-right: 16rpx;
}
.body {
  flex: 1;
  min-width: 0;
}
.t {
  font-weight: 600;
  font-size: 28rpx;
  display: block;
}
.c {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.dot {
  width: 16rpx;
  height: 16rpx;
  background: $love-primary;
  border-radius: 50%;
  margin-left: 8rpx;
  margin-top: 8rpx;
}
</style>
