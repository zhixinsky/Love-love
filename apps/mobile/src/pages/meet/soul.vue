<template>
  <view class="page">
    <view class="hero love-card">
      <text class="emoji">✨</text>
      <text class="title">灵魂匹配</text>
      <text class="sub">根据城市、心情日记与资料为你推荐契合的 TA</text>
      <view class="love-btn love-btn-primary sm" @tap="load">
        {{ loading ? '匹配中...' : '刷新推荐' }}
      </view>
    </view>

    <EmptyState v-if="!list.length && !loading" text="暂无匹配，完善资料或写日记后再试" />
    <view
      v-for="u in list"
      :key="u.id"
      class="card love-card"
      @tap="goUser(u.id)"
    >
      <image :src="u.avatar || '/static/default-avatar.png'" class="av" mode="aspectFill" />
      <view class="body">
        <view class="top">
          <text class="name">{{ u.nickname }}</text>
          <text class="pct">{{ u.matchPercent }}%</text>
        </view>
        <text class="bio">{{ u.bio || u.city || '暂无简介' }}</text>
        <view class="tags">
          <text v-for="r in u.reasons" :key="r" class="tag">{{ r }}</text>
        </view>
      </view>
      <view class="love-btn love-btn-outline sm" @tap.stop="follow(u)">关注</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import {
  getSoulMatchList,
  toggleFollow,
  type SoulMatchUser,
} from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';

const { checkLogin } = useAuthRedirect();
const list = ref<SoulMatchUser[]>([]);
const loading = ref(false);

onShow(() => {
  if (!checkLogin()) return;
  load();
});

async function load() {
  loading.value = true;
  try {
    const res = await getSoulMatchList(12);
    list.value = res.list || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function goUser(id: string | number) {
  uni.navigateTo({ url: '/pages/user/home?id=' + id });
}

async function follow(u: SoulMatchUser) {
  await toggleFollow(Number(u.id));
  uni.showToast({ title: '已关注', icon: 'success' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.hero {
  text-align: center;
  padding: 36rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #f3e8ff, #fff5f8);
}
.emoji {
  font-size: 64rpx;
  display: block;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
  margin-top: 12rpx;
}
.sub {
  font-size: 26rpx;
  color: $love-text-muted;
  margin: 12rpx 0 24rpx;
  display: block;
  line-height: 1.5;
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
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.av {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.body {
  flex: 1;
  min-width: 0;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  font-size: 30rpx;
  font-weight: 600;
}
.pct {
  font-size: 32rpx;
  font-weight: 700;
  color: #9b59b6;
}
.bio {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}
.tag {
  font-size: 20rpx;
  background: #f3e8ff;
  color: #7c3aed;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.card .sm {
  flex-shrink: 0;
  margin-left: 8rpx;
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 24rpx;
}
</style>
