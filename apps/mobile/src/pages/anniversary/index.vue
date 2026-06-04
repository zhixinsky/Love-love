<template>
  <view class="page">
    <view class="header">
      <text class="title">纪念日</text>
      <text class="sub">不错过每一个值得铭记的日子</text>
      <view class="love-btn love-btn-primary sm" @tap="goAdd">+ 添加</view>
    </view>

    <EmptyState v-if="!list.length && !loading" text="记录恋爱、生日与第一次" />
    <view
      v-for="item in list"
      :key="item.id"
      class="card love-card"
      @tap="showActions(item)"
    >
      <view class="left">
        <text class="emoji">{{ emojiFor(item) }}</text>
      </view>
      <view class="mid">
        <text class="name">{{ item.title }}</text>
        <text class="date">{{ item.anniversaryDate }}</text>
      </view>
      <view class="right">
        <text class="num">{{ item.daysLeft ?? 0 }}</text>
        <text class="unit">天后</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { deleteAnniversary, getAnniversaryList } from '@/api/anniversary';
import EmptyState from '@/components/EmptyState.vue';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const res = await getAnniversaryList();
    list.value = (res.list as any[]) || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function emojiFor(item: any) {
  const t = String(item.title || '');
  if (t.includes('生日')) return '🎂';
  if (t.includes('情人节')) return '💝';
  if (t.includes('周年')) return '💍';
  return '📅';
}

function goAdd() {
  uni.navigateTo({ url: '/pages/anniversary/edit' });
}

function showActions(item: any) {
  uni.showActionSheet({
    itemList: ['删除纪念日'],
    success: async (res) => {
      if (res.tapIndex !== 0) return;
      uni.showModal({
        title: '确认删除',
        content: `删除「${item.title}」？`,
        success: async (r) => {
          if (!r.confirm) return;
          await deleteAnniversary(item.id);
          list.value = list.value.filter((x) => x.id !== item.id);
          uni.showToast({ title: '已删除', icon: 'success' });
        },
      });
    },
  });
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
  margin-bottom: 8rpx;
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
}
.card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  margin-bottom: 16rpx;
}
.emoji {
  font-size: 48rpx;
}
.mid {
  flex: 1;
  margin-left: 20rpx;
}
.name {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.date {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.right {
  text-align: center;
  min-width: 100rpx;
}
.num {
  font-size: 44rpx;
  font-weight: 700;
  color: $love-primary;
  display: block;
  line-height: 1;
}
.unit {
  font-size: 22rpx;
  color: $love-text-muted;
}
</style>
