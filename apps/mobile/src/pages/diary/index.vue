<template>
  <view class="page">
    <view class="tabs">
      <text
        v-for="t in tabs"
        :key="String(t.v)"
        class="tab"
        :class="{ active: vis === t.v }"
        @tap="switchTab(t.v)"
      >
        {{ t.label }}
      </text>
    </view>
    <view class="love-btn love-btn-primary" @tap="goEdit">写日记</view>
    <scroll-view
      scroll-y
      class="list-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-for="d in list" :key="d.id" class="item love-card" @tap="goDetail(d.id)">
        <text class="t">{{ d.title || '无标题' }}</text>
        <text class="c">{{ (d.content || '').slice(0, 80) }}</text>
        <text class="m">{{ d.mood || '—' }} · {{ formatTime(d.createdAt) }}</text>
      </view>
      <EmptyState v-if="!loading && !list.length" text="还没有日记，写下第一篇吧" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
import { formatTime } from '@/utils/format';

const { checkLogin } = useAuthRedirect();
const tabs = [
  { label: '我的', v: 1 as number | undefined },
  { label: '情侣', v: 2 as number | undefined },
  { label: '全部', v: undefined as number | undefined },
];
const vis = ref<number | undefined>(1);
const list = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);

onShow(() => {
  if (!checkLogin()) return;
  load();
});

function switchTab(v: number | undefined) {
  vis.value = v;
  load();
}

async function load() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: 1, pageSize: 50 };
    if (vis.value) params.visibility = vis.value;
    const res = await getDiaryList(params);
    list.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await load();
  refreshing.value = false;
}

function goEdit() {
  uni.navigateTo({ url: '/pages/diary/edit' });
}
function goDetail(id: string | number) {
  uni.navigateTo({ url: `/pages/diary/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 24rpx;
  background: $love-bg;
}
.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  flex-shrink: 0;
}
.tab {
  padding: 12rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
}
.tab.active {
  background: $love-primary;
  color: #fff;
}
.list-scroll {
  flex: 1;
  height: 0;
  margin-top: 16rpx;
}
.item {
  margin-bottom: 20rpx;
  padding: 24rpx;
}
.t {
  font-weight: 600;
  display: block;
}
.c {
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
  line-height: 1.5;
}
.m {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
}
</style>
