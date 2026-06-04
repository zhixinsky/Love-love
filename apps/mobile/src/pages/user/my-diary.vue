<template>
  <view class="page">
    <scroll-view
      scroll-y
      class="scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <EmptyState v-if="!list.length && !loading" text="还没有日记，去写一篇吧" />
      <view v-for="d in list" :key="d.id" class="item love-card" @tap="go(d.id)">
        <text class="t">{{ d.title || '无标题' }}</text>
        <text class="c">{{ (d.content || '').slice(0, 60) }}</text>
        <view class="foot">
          <text class="m">{{ d.mood || '—' }}</text>
          <text class="time">{{ formatRelative(d.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>
    <view class="fab" @tap="goEdit">+</view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';
import { formatRelative } from '@/utils/format';

const list = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const res = await getDiaryList({ page: 1, pageSize: 50, tab: 'mine' });
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await load();
  refreshing.value = false;
}

function go(id: string) {
  uni.navigateTo({ url: '/pages/diary/detail?id=' + id });
}

function goEdit() {
  uni.navigateTo({ url: '/pages/diary/edit' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  background: $love-bg;
  min-height: 100vh;
  position: relative;
}
.scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
.item {
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.t {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.c {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
  line-height: 1.4;
}
.foot {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $love-text-muted;
}
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 96rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background: linear-gradient(135deg, $love-primary, #ff8fab);
  color: #fff;
  font-size: 48rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
}
</style>
