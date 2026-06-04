<template>
  <view class="page">
    <text class="head">我关注的人 · {{ list.length }}</text>
    <EmptyState v-if="!list.length && !loading" text="还没有关注任何人" />
    <UserRow
      v-for="u in list"
      :key="u.id"
      :nickname="u.nickname"
      :avatar="u.avatar"
      show-arrow
      @tap="go(u.id)"
    />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getFollowingList } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
import UserRow from '@/components/UserRow.vue';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getFollowingList({ page: 1, pageSize: 100 });
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
});

function go(id: string) {
  uni.navigateTo({ url: '/pages/user/home?id=' + id });
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
</style>
