<template>
  <view class="post-page">
    <scroll-view scroll-x class="channels" :show-scrollbar="false">
      <view
        v-for="ch in channels"
        :key="ch.value"
        class="channel"
        :class="{ active: tab === ch.value }"
        @tap="switchTab(ch.value)"
      >
        {{ ch.label }}
      </view>
    </scroll-view>

    <scroll-view
      scroll-y
      class="feed-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="loading && !list.length" class="tip">加载中...</view>
      <EmptyState v-else-if="!list.length" text="暂无动态，发一条试试吧" />
      <view v-else class="feed">
        <PostCard
          v-for="item in list"
          :key="item.id"
          :post="item"
          @tap="goDetail(item.id)"
          @like="onLike(item)"
          @comment="goDetail(item.id)"
          @collect="onCollect(item)"
        />
      </view>
      <view v-if="loadingMore" class="tip">加载更多...</view>
      <view v-else-if="noMore && list.length" class="tip">没有更多了</view>
    </scroll-view>

    <view class="fab" @tap="goPublish">+</view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getPostList } from '@/api/post';
import { toggleCollect, toggleLike } from '@/api/like';
import EmptyState from '@/components/EmptyState.vue';
import PostCard from '@/components/PostCard.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();
const channels = [
  { label: '推荐', value: 'recommend' },
  { label: '关注', value: 'follow' },
  { label: '附近', value: 'nearby' },
  { label: '情侣', value: 'couple' },
  { label: '单身', value: 'single' },
];
const tab = ref('recommend');
const loading = ref(false);
const loadingMore = ref(false);
const refreshing = ref(false);
const noMore = ref(false);
const page = ref(1);
const list = ref<any[]>([]);

onShow(() => {
  if (!checkLogin()) return;
  reload();
});

async function fetchPage(p: number, append: boolean) {
  const res = await getPostList({ page: p, pageSize: 15, tab: tab.value });
  const rows = (res.list as any[]) || [];
  if (append) list.value = [...list.value, ...rows];
  else list.value = rows;
  noMore.value = rows.length < 15;
  page.value = p;
}

async function reload() {
  loading.value = true;
  page.value = 1;
  noMore.value = false;
  try {
    await fetchPage(1, false);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(v: string) {
  tab.value = v;
  reload();
}

async function onRefresh() {
  refreshing.value = true;
  await reload();
  refreshing.value = false;
}

async function loadMore() {
  if (loadingMore.value || noMore.value || loading.value) return;
  loadingMore.value = true;
  try {
    await fetchPage(page.value + 1, true);
  } finally {
    loadingMore.value = false;
  }
}

async function onLike(item: any) {
  const res = await toggleLike(1, Number(item.id));
  item.isLiked = res.liked;
  item.likeCount = res.likeCount;
}

async function onCollect(item: any) {
  const res = await toggleCollect(1, Number(item.id));
  item.isCollected = res.collected;
}

function goPublish() {
  uni.navigateTo({ url: '/pages/post/publish' });
}
function goDetail(id: string | number) {
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.post-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $love-bg;
}
.channels {
  white-space: nowrap;
  padding: 20rpx 24rpx;
  background: #fff;
  flex-shrink: 0;
}
.channel {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: $love-text-muted;
  background: $love-bg;
}
.channel.active {
  background: $love-primary;
  color: #fff;
}
.feed-scroll {
  flex: 1;
  height: 0;
}
.feed {
  padding: 24rpx;
  padding-bottom: 160rpx;
}
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 180rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  color: #fff;
  font-size: 48rpx;
  text-align: center;
  line-height: 96rpx;
  z-index: 10;
}
.tip {
  text-align: center;
  padding: 32rpx;
  color: $love-text-muted;
  font-size: 24rpx;
}
</style>
