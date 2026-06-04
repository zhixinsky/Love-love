<template>
  <view class="page">
    <view v-if="needLocation" class="tip love-card">
      <text>开启定位后，按真实距离推荐附近用户</text>
      <view class="love-btn love-btn-primary sm" @tap="refresh">开启定位</view>
    </view>

    <template v-else-if="current">
      <view class="card-stack love-card">
        <image :src="current.avatar || '/static/default-avatar.png'" class="cover" mode="aspectFill" />
        <view class="overlay">
          <text class="name">{{ current.nickname }}</text>
          <text class="sub">{{ current.city }} · {{ current.distance }}</text>
        </view>
      </view>
      <view class="actions">
        <view class="btn skip" @tap="skip">跳过</view>
        <view class="btn like" @tap="followCurrent">喜欢</view>
      </view>
      <text class="remain">剩余 {{ list.length }} 人可浏览</text>
    </template>

    <EmptyState v-else-if="!loading" text="附近暂无更多用户" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { getNearbyUsers, toggleFollow, updateUserLocation } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';

const list = ref<any[]>([]);
const loading = ref(false);
const needLocation = ref(false);
const index = ref(0);

const current = computed(() => list.value[index.value] || null);

onShow(() => refresh());

async function refresh() {
  await syncLocation();
  await load();
}

function syncLocation(): Promise<void> {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'gcj02',
      success: async (res) => {
        try {
          await updateUserLocation(res.latitude, res.longitude);
          needLocation.value = false;
        } catch {
          needLocation.value = true;
        }
        resolve();
      },
      fail: () => {
        needLocation.value = true;
        uni.showToast({ title: '需要定位权限', icon: 'none' });
        resolve();
      },
    });
  });
}

async function load() {
  loading.value = true;
  try {
    const res = await getNearbyUsers();
    needLocation.value = Boolean(res.needLocation);
    list.value = (res.list as any[]) || [];
    index.value = 0;
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function skip() {
  if (index.value < list.value.length - 1) index.value += 1;
  else {
    uni.showToast({ title: '没有更多了', icon: 'none' });
    load();
  }
}

async function followCurrent() {
  if (!current.value) return;
  await toggleFollow(Number(current.value.id));
  uni.showToast({ title: '已关注', icon: 'success' });
  skip();
}

function goUser(id: string) {
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
.tip {
  padding: 32rpx;
  text-align: center;
  font-size: 28rpx;
  color: $love-text-muted;
}
.sm {
  margin-top: 20rpx;
  display: inline-block;
}
.card-stack {
  position: relative;
  overflow: hidden;
  padding: 0;
  border-radius: 24rpx;
}
.cover {
  width: 100%;
  height: 720rpx;
}
.overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 32rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
}
.sub {
  font-size: 26rpx;
  margin-top: 8rpx;
  opacity: 0.9;
  display: block;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  margin-top: 40rpx;
}
.btn {
  width: 140rpx;
  height: 140rpx;
  line-height: 140rpx;
  text-align: center;
  border-radius: 50%;
  font-size: 30rpx;
  font-weight: 600;
}
.skip {
  background: #fff;
  color: $love-text-muted;
  border: 2rpx solid $love-border;
}
.like {
  background: linear-gradient(135deg, $love-primary, #ff8fab);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.35);
}
.remain {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 24rpx;
}
</style>
