<template>
  <view class="page">
    <EmptyState v-if="!list.length && !loading" text="暂无点赞通知" />
    <NotificationItem
      v-for="item in list"
      :key="item.id"
      :item="item"
      icon="❤️"
      @tap="read(item)"
    />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getNotificationList, markNotificationRead } from '@/api/notification';
import EmptyState from '@/components/EmptyState.vue';
import NotificationItem from '@/components/NotificationItem.vue';
import { openNotificationTarget } from '@/utils/notification-nav';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const res = await getNotificationList({ page: 1, pageSize: 50, type: 1 });
    list.value = (res.list as any[]) || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

async function read(item: any) {
  if (!item.isRead) {
    await markNotificationRead([item.id]);
    item.isRead = 1;
  }
  openNotificationTarget(item);
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
</style>
