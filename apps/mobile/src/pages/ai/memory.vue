<template>
  <view class="page">
    <view class="intro love-card">
      <text class="t">爱情档案</text>
      <text class="d">恋恋会记住你在聊天和日记里提到的重要细节，让陪伴更懂你。</text>
    </view>

    <view class="add-box love-card">
      <input v-model="newContent" class="inp" placeholder="手动添加一条记忆..." maxlength="120" />
      <view class="love-btn love-btn-primary sm" @tap="add">添加</view>
    </view>

    <EmptyState v-if="!list.length && !loading" text="还没有记忆，多和恋恋聊聊吧" />
    <view v-for="item in list" :key="item.id" class="item love-card">
      <view class="stars">
        <text v-for="n in 5" :key="n" class="star" :class="{ on: n <= (item.importance || 1) }">★</text>
      </view>
      <text class="content">{{ item.content }}</text>
      <text class="meta">{{ formatRelative(item.createdAt) }}</text>
      <text class="del" @tap="remove(item.id)">删除</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { deleteAiMemory, getAiMemoryList } from '@/api/ai';
import EmptyState from '@/components/EmptyState.vue';
import { formatRelative } from '@/utils/format';

const list = ref<any[]>([]);
const loading = ref(false);
const newContent = ref('');

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const res = await getAiMemoryList();
    list.value = (res.list as any[]) || [];
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

async function add() {
  if (!newContent.value.trim()) return;
  uni.showToast({
    title: '记忆会随聊天自动沉淀，暂不支持手动添加',
    icon: 'none',
  });
  newContent.value = '';
}

async function remove(id: string) {
  uni.showModal({
    title: '删除记忆',
    content: '删除后恋恋将不再引用这条信息',
    success: async (r) => {
      if (!r.confirm) return;
      await deleteAiMemory(id);
      list.value = list.value.filter((x) => x.id !== id);
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
.intro {
  margin-bottom: 20rpx;
}
.intro .t {
  font-size: 32rpx;
  font-weight: 700;
  display: block;
}
.intro .d {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  line-height: 1.5;
  display: block;
}
.add-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}
.inp {
  flex: 1;
  font-size: 28rpx;
}
.sm {
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 26rpx;
  flex-shrink: 0;
}
.item {
  padding: 24rpx;
  margin-bottom: 16rpx;
  position: relative;
}
.stars {
  margin-bottom: 8rpx;
}
.star {
  color: #ddd;
  font-size: 24rpx;
}
.star.on {
  color: #ffb347;
}
.content {
  font-size: 28rpx;
  line-height: 1.5;
  display: block;
  padding-right: 80rpx;
}
.meta {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
}
.del {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  color: #e74c3c;
  font-size: 24rpx;
}
</style>
