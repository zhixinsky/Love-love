<template>
  <view class="page">
    <view class="menu love-card">
      <view class="mi" @tap="go('/pages/notification/like')">
        <text>点赞通知</text>
        <text v-if="unreadByType[1]" class="badge">{{ unreadByType[1] }}</text>
        <text class="arrow">›</text>
      </view>
      <view class="mi" @tap="go('/pages/notification/comment')">
        <text>评论通知</text>
        <text v-if="unreadByType[2]" class="badge">{{ unreadByType[2] }}</text>
        <text class="arrow">›</text>
      </view>
      <view class="mi" @tap="go('/pages/notification/ai')">
        <text>AI 提醒</text>
        <text class="arrow">›</text>
      </view>
      <view class="mi" @tap="go('/pages/notification/couple')">
        <text>情侣通知</text>
        <text class="arrow">›</text>
      </view>
    </view>
    <text class="sec-title">全部消息</text>
    <view
      v-for="n in list"
      :key="n.id"
      class="item love-card"
      :class="{ unread: !n.isRead }"
      @tap="openItem(n)"
    >
      <text class="t">{{ n.title }}</text>
      <text class="c">{{ n.content }}</text>
      <text class="time">{{ formatTime(n.createdAt) }}</text>
    </view>
    <EmptyState v-if="!list.length && !loading" text="暂无消息" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getNotificationList, markNotificationRead } from '@/api/notification';
import EmptyState from '@/components/EmptyState.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
import { formatTime } from '@/utils/format';
import { openNotificationTarget } from '@/utils/notification-nav';

const { checkLogin } = useAuthRedirect();
const list = ref<any[]>([]);
const loading = ref(false);
const unreadByType = ref<Record<number, number>>({});

onShow(async () => {
  if (!checkLogin()) return;
  loading.value = true;
  try {
    const res = await getNotificationList({ page: 1, pageSize: 30 });
    list.value = (res.list as any[]) || [];
    const types = [1, 2, 3, 4];
    for (const t of types) {
      const r = await getNotificationList({ page: 1, pageSize: 1, type: t });
      unreadByType.value[t] = (r as { unreadCount?: number }).unreadCount || 0;
    }
  } finally {
    loading.value = false;
  }
});

async function openItem(n: any) {
  if (!n.isRead) {
    await markNotificationRead([Number(n.id)]);
    n.isRead = 1;
  }
  openNotificationTarget(n);
}

function go(url: string) {
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.mi {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $love-border;
}
.arrow {
  margin-left: auto;
  color: $love-text-muted;
}
.badge {
  margin-left: 12rpx;
  background: $love-primary;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
}
.sec-title {
  display: block;
  margin: 24rpx 0 12rpx;
  font-size: 26rpx;
  color: $love-text-muted;
}
.item {
  margin-top: 16rpx;
  padding: 24rpx;
}
.item.unread {
  border-left: 6rpx solid $love-primary;
}
.t {
  font-weight: 600;
  display: block;
}
.c {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.time {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
</style>
