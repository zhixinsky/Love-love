<template>
  <view class="page">
    <EmptyState v-if="!list.length && !loading" text="还没有收藏" />
    <view v-for="c in list" :key="c.id" class="item love-card" @tap="open(c)">
      <text class="type">{{ c.targetType === 1 ? '动态' : '日记' }}</text>
      <text class="title">{{ c.title || '收藏内容' }}</text>
      <text class="time">{{ formatRelative(c.createdAt) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getCollectList } from '@/api/collect';
import EmptyState from '@/components/EmptyState.vue';
import { formatRelative } from '@/utils/format';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getCollectList({ page: 1, pageSize: 50 });
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
});

function open(c: any) {
  if (c.targetType === 1) {
    uni.navigateTo({ url: '/pages/post/detail?id=' + c.targetId });
  } else {
    uni.navigateTo({ url: '/pages/diary/detail?id=' + c.targetId });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.item {
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.type {
  font-size: 22rpx;
  color: $love-primary;
  background: #fff5f8;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  display: inline-block;
  margin-bottom: 8rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.time {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
</style>
