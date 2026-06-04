<template>
  <view class="page">
    <text class="head">我的粉丝 · {{ list.length }}</text>
    <EmptyState v-if="!list.length && !loading" text="还没有粉丝" />
    <UserRow
      v-for="u in list"
      :key="u.id"
      :nickname="u.nickname"
      :avatar="u.avatar"
      show-arrow
      @tap="go(u.id)"
    >
      <template #trail>
        <view class="actions">
          <view class="love-btn love-btn-outline sm" @tap.stop="followBack(u)">回关</view>
          <view class="love-btn love-btn-primary sm" @tap.stop="openChat(u)">私信</view>
        </view>
      </template>
    </UserRow>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { createChatSession } from '@/api/chat';
import { getFollowersList, getPublicUser, toggleFollow } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
import UserRow from '@/components/UserRow.vue';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getFollowersList({ page: 1, pageSize: 100 });
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
});

function go(id: string) {
  uni.navigateTo({ url: '/pages/user/home?id=' + id });
}

async function followBack(u: any) {
  await toggleFollow(Number(u.id));
  uni.showToast({ title: '已关注', icon: 'success' });
}

async function openChat(u: { id: string | number }) {
  try {
    const profile = (await getPublicUser(u.id)) as { canMessage?: boolean };
    if (!profile.canMessage) {
      uni.showToast({ title: '需互相关注后才能私信', icon: 'none' });
      return;
    }
    uni.showLoading({ title: '连接中' });
    const res = await createChatSession(u.id);
    uni.navigateTo({
      url: `/pages/chat/detail?sessionId=${res.sessionId}&targetUserId=${res.targetUserId}`,
    });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '无法发起私信',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
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
.head {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-bottom: 16rpx;
  display: block;
}
.actions {
  display: flex;
  gap: 8rpx;
  flex-shrink: 0;
}
.sm {
  padding: 0 16rpx;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 22rpx;
  margin: 0;
}
</style>
