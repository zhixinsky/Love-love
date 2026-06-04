<template>
  <view class="page">
    <view class="hero">
      <text class="wave">🌊</text>
      <text class="title">漂流瓶</text>
      <text class="sub">把心事交给大海，或许能遇见回应</text>
    </view>

    <view class="actions">
      <view class="love-btn love-btn-primary pick" @tap="pick">
        {{ picking ? '打捞中...' : '🍾 捞一个瓶子' }}
      </view>
      <view class="love-btn love-btn-outline" @tap="goThrow">✉️ 扔一个瓶子</view>
    </view>

    <view v-if="lastPick" class="preview love-card" @tap="goDetail(lastPick.id)">
      <text class="label">刚刚捞到</text>
      <text class="content">{{ lastPick.content }}</text>
      <text class="meta">{{ lastPick.city || '来自远方' }} · 点击查看</text>
    </view>

    <text class="sec">我扔出的瓶子</text>
    <EmptyState v-if="!myList.length && !loadingMine" text="还没有扔过瓶子" />
    <view
      v-for="b in myList"
      :key="b.id"
      class="mine-item love-card"
      @tap="goDetail(b.id)"
    >
      <text class="mine-content">{{ (b.content as string)?.slice(0, 60) }}</text>
      <text class="mine-meta">{{ b.statusLabel }} · {{ formatRelative(b.createdAt as string) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getMyBottles, pickBottle } from '@/api/bottle';
import type { BottleListItem } from '@/types/bottle';
import EmptyState from '@/components/EmptyState.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
import { formatRelative } from '@/utils/format';

const { checkLogin } = useAuthRedirect();
const picking = ref(false);
const lastPick = ref<Record<string, unknown> | null>(null);
const myList = ref<BottleListItem[]>([]);
const loadingMine = ref(false);

onShow(() => {
  if (!checkLogin()) return;
  loadMine();
});

async function loadMine() {
  loadingMine.value = true;
  try {
    const res = await getMyBottles();
    myList.value = res.list || [];
  } catch {
    myList.value = [];
  } finally {
    loadingMine.value = false;
  }
}

async function pick() {
  picking.value = true;
  try {
    lastPick.value = (await pickBottle()) as Record<string, unknown>;
    uni.showToast({ title: '捞到啦', icon: 'success' });
    setTimeout(() => goDetail(lastPick.value?.id), 600);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '海里暂时没有瓶子',
      icon: 'none',
    });
  } finally {
    picking.value = false;
  }
}

function goThrow() {
  uni.navigateTo({ url: '/pages/bottle/throw' });
}

function goDetail(id: unknown) {
  if (!id) return;
  uni.navigateTo({ url: `/pages/bottle/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 32rpx;
  padding-bottom: 120rpx;
  background: linear-gradient(180deg, #e8f4ff 0%, $love-bg 35%);
  min-height: 100vh;
}
.hero {
  text-align: center;
  padding: 40rpx 0 32rpx;
}
.wave {
  font-size: 80rpx;
  display: block;
}
.title {
  font-size: 44rpx;
  font-weight: 700;
  color: #2c5aa0;
  display: block;
  margin-top: 12rpx;
}
.sub {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.pick {
  box-shadow: 0 12rpx 32rpx rgba(44, 90, 160, 0.25);
}
.preview {
  margin-top: 32rpx;
  padding: 28rpx;
  border-left: 8rpx solid #5b9bd5;
}
.label {
  font-size: 22rpx;
  color: #5b9bd5;
  font-weight: 600;
  display: block;
}
.content {
  font-size: 30rpx;
  line-height: 1.6;
  margin-top: 12rpx;
  display: block;
}
.meta {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
}
.sec {
  display: block;
  margin: 40rpx 0 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: $love-text;
}
.mine-item {
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.mine-content {
  font-size: 28rpx;
  display: block;
  line-height: 1.5;
}
.mine-meta {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
</style>
