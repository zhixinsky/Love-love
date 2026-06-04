<template>
  <view class="page" v-if="diary">
    <view class="head love-card">
      <text class="title">{{ diary.title || '无标题' }}</text>
      <view class="tags">
        <text class="tag mood">{{ moodEmoji }} {{ diary.mood || '心情' }}</text>
        <text v-if="diary.weather" class="tag">{{ diary.weather }}</text>
        <text class="tag vis">{{ visLabel }}</text>
      </view>
      <text class="date">{{ formatDate(diary.createdAt || '') }} · {{ formatRelative(diary.createdAt || '') }}</text>
    </view>

    <view class="body love-card">
      <text class="content">{{ diary.content }}</text>
      <view v-if="media.length" class="imgs">
        <image
          v-for="(m, i) in media"
          :key="i"
          :src="m.url"
          mode="aspectFill"
          class="img"
          @tap="preview(i)"
        />
      </view>
    </view>

    <view class="btns">
      <view class="love-btn love-btn-outline" @tap="edit">编辑</view>
      <view class="love-btn love-btn-outline" @tap="goAi">AI 恋爱分析</view>
      <view class="love-btn danger" @tap="remove">删除日记</view>
    </view>
  </view>
  <EmptyState v-else-if="!loading" text="日记不存在或已删除" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { deleteDiary, getDiaryDetail } from '@/api/diary';
import type { DiaryDetail } from '@/types/diary';
import EmptyState from '@/components/EmptyState.vue';
import { formatDate, formatRelative } from '@/utils/format';

const id = ref('');
const loading = ref(true);
const diary = ref<DiaryDetail | null>(null);
const media = ref<{ url: string }[]>([]);
const visLabel = ref('');

const moodEmoji = computed(() => {
  const m = String(diary.value?.mood || '');
  if (m.includes('开心') || m.includes('乐')) return '😊';
  if (m.includes('难过') || m.includes('丧')) return '😢';
  if (m.includes('爱')) return '🥰';
  return '📝';
});

const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
if (cur?.options?.id) {
  id.value = cur.options.id;
  load();
}

async function load() {
  loading.value = true;
  try {
    const d = await getDiaryDetail(id.value);
    diary.value = d;
    media.value = (d.mediaList as { url: string }[]) || [];
    const v = Number(d.visibility);
    visLabel.value = v === 1 ? '仅自己' : v === 2 ? '情侣可见' : '公开';
  } catch {
    diary.value = null;
  } finally {
    loading.value = false;
  }
}

function edit() {
  uni.navigateTo({ url: '/pages/diary/edit?id=' + id.value });
}

function goAi() {
  uni.navigateTo({ url: '/pages/ai/analysis' });
}

function preview(i: number) {
  uni.previewImage({ urls: media.value.map((m) => m.url), current: media.value[i].url });
}

async function remove() {
  uni.showModal({
    title: '删除日记',
    content: '删除后无法恢复，确定吗？',
    success: async (r) => {
      if (!r.confirm) return;
      await deleteDiary(id.value);
      uni.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 400);
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
  padding-bottom: 48rpx;
}
.head {
  margin-bottom: 20rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
  line-height: 1.3;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.tag {
  font-size: 22rpx;
  background: #fff5f8;
  color: $love-primary;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.date {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 16rpx;
  display: block;
}
.body {
  padding: 28rpx;
}
.content {
  font-size: 30rpx;
  line-height: 1.75;
  display: block;
  white-space: pre-wrap;
}
.imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}
.img {
  width: 210rpx;
  height: 210rpx;
  border-radius: 16rpx;
}
.btns {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.danger {
  background: #fff;
  color: #e74c3c;
  border: 2rpx solid #e74c3c;
}
</style>
