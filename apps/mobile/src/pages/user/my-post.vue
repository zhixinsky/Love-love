<template>
  <view class="page">
    <text class="head">我的动态 · {{ list.length }}</text>
    <EmptyState v-if="!list.length && !loading" text="还没有动态，去广场发布吧" />
    <PostCard v-for="p in list" :key="p.id" :post="p" @tap="go(p.id)" />
    <view class="fab" @tap="goPublish">+</view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getPostList } from '@/api/post';
import EmptyState from '@/components/EmptyState.vue';
import PostCard from '@/components/PostCard.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(async () => {
  loading.value = true;
  try {
    const res = await getPostList({ page: 1, pageSize: 50, tab: 'mine' });
    list.value = (res.list as any[]) || [];
  } finally {
    loading.value = false;
  }
});
function go(id: string) { uni.navigateTo({ url: '/pages/post/detail?id=' + id }); }
function goPublish() { uni.navigateTo({ url: '/pages/post/publish' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;position:relative;}
.head{font-size:26rpx;color:$love-text-muted;margin-bottom:16rpx;display:block;}
.fab{position:fixed;right:32rpx;bottom:120rpx;width:96rpx;height:96rpx;line-height:96rpx;text-align:center;background:linear-gradient(135deg,$love-primary,#ff8fab);color:#fff;font-size:48rpx;border-radius:50%;box-shadow:0 8rpx 24rpx rgba(255,107,157,.4);}
</style>