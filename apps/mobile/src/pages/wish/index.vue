<template>
  <view class="page">
    <view class="header">
      <text class="title">愿望清单</text>
      <text class="sub">和 TA 一起打卡的小目标</text>
      <view class="love-btn love-btn-primary sm" @tap="goAdd">+ 添加愿望</view>
    </view>

    <text v-if="pending.length" class="sec">进行中 · {{ pending.length }}</text>
    <view
      v-for="item in pending"
      :key="item.id"
      class="item love-card"
      @tap="toggle(item)"
    >
      <view class="check" />
      <view class="body">
        <text class="name">{{ item.title }}</text>
        <text v-if="item.description" class="desc">{{ item.description }}</text>
      </view>
    </view>

    <text v-if="done.length" class="sec done-sec">已完成 · {{ done.length }}</text>
    <view v-for="item in done" :key="'d' + item.id" class="item love-card done">
      <text class="check on">✓</text>
      <view class="body">
        <text class="name">{{ item.title }}</text>
      </view>
    </view>

    <EmptyState v-if="!list.length && !loading" text="还没有愿望，一起列个清单吧" />
    <text class="hint">点击圆圈标记为已完成</text>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { completeWish, getWishList } from '@/api/wish';
import EmptyState from '@/components/EmptyState.vue';

const list = ref<any[]>([]);
const loading = ref(false);
const pending = computed(() => list.value.filter((x) => !x.completed));
const done = computed(() => list.value.filter((x) => x.completed));

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const res = await getWishList();
    list.value = (res.list as any[]) || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function goAdd() {
  uni.navigateTo({ url: '/pages/wish/edit' });
}

async function toggle(item: any) {
  if (item.completed) return;
  await completeWish(item.id);
  item.completed = true;
  uni.showToast({ title: '愿望达成 🎉', icon: 'success' });
}

</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.header {
  margin-bottom: 24rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
}
.sub {
  font-size: 26rpx;
  color: $love-text-muted;
  margin: 8rpx 0 20rpx;
  display: block;
}
.sm {
  display: inline-block;
  padding: 0 40rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
}
.sec {
  font-size: 26rpx;
  font-weight: 600;
  margin: 24rpx 0 12rpx;
  display: block;
}
.done-sec {
  color: $love-text-muted;
}
.item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.check {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid $love-primary;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}
.check.on {
  background: $love-primary;
  color: #fff;
  font-size: 24rpx;
  text-align: center;
  line-height: 40rpx;
  border: none;
}
.body {
  flex: 1;
}
.name {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.desc {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.item.done .name {
  text-decoration: line-through;
  color: $love-text-muted;
  font-weight: 400;
}
.hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 32rpx;
}
</style>
