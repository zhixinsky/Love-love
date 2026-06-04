<template>
  <view class="page">
    <text class="tip">拉黑后对方无法给你发私信，也不会出现在附近的人</text>
    <EmptyState v-if="!list.length && !loading" text="黑名单为空" />
    <UserRow
      v-for="u in list"
      :key="u.userId"
      :nickname="u.nickname"
      :avatar="u.avatar"
      sub="已拉黑"
    >
      <template #trail>
        <text class="unlink" @tap.stop="unblock(u.userId)">移除</text>
      </template>
    </UserRow>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getBlockList, unblockUser } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
import UserRow from '@/components/UserRow.vue';

const list = ref<any[]>([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getBlockList();
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
});

async function unblock(id: string) {
  await unblockUser(id);
  list.value = list.value.filter((x) => x.userId !== id);
  uni.showToast({ title: '已移除', icon: 'success' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.tip {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-bottom: 20rpx;
  line-height: 1.5;
  display: block;
}
.unlink {
  color: #e74c3c;
  font-size: 26rpx;
  padding: 8rpx 16rpx;
}
</style>
