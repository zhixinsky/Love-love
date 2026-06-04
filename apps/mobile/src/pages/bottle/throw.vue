<template>
  <view class="page">
    <text class="tip">写下此刻的心情，扔进海里等待缘分</text>
    <textarea
      v-model="content"
      class="love-input area"
      placeholder="可以是秘密、祝福，或一句想说的话..."
      maxlength="500"
    />
    <text class="count">{{ content.length }}/500</text>

    <input v-model="city" class="love-input" placeholder="所在城市（可选，如：上海）" />

    <view class="row love-card">
      <text>匿名扔出</text>
      <switch :checked="anonymous" color="#ff6b9d" @change="onAnon" />
    </view>

    <view class="types">
      <text
        v-for="t in types"
        :key="t.v"
        class="chip"
        :class="{ on: bottleType === t.v }"
        @tap="bottleType = t.v"
      >{{ t.label }}</text>
    </view>

    <view class="love-btn love-btn-primary" @tap="submit">{{ submitting ? '投递中...' : '扔进海里' }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { throwBottle } from '@/api/bottle';
import { readSwitchChecked } from '@/utils/uni-event';

const content = ref('');
const city = ref('');
const anonymous = ref(true);
const bottleType = ref(1);
const submitting = ref(false);

const types = [
  { label: '心情', v: 1 },
  { label: '祝福', v: 2 },
  { label: '提问', v: 3 },
];

function onAnon(e: unknown) {
  anonymous.value = readSwitchChecked(e);
}

async function submit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    await throwBottle({
      content: content.value,
      city: city.value,
      isAnonymous: anonymous.value ? 1 : 0,
      bottleType: bottleType.value,
    });
    uni.showToast({ title: '已漂向大海', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '投递失败',
      icon: 'none',
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 32rpx;
  background: linear-gradient(180deg, #e8f4ff 0%, $love-bg 30%);
  min-height: 100vh;
}
.tip {
  font-size: 28rpx;
  color: $love-text-muted;
  display: block;
  margin-bottom: 24rpx;
}
.area {
  min-height: 360rpx;
}
.count {
  text-align: right;
  font-size: 22rpx;
  color: $love-text-muted;
  margin: -8rpx 0 24rpx;
  display: block;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.types {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.chip {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background: #fff;
  font-size: 26rpx;
  color: $love-text-muted;
}
.chip.on {
  background: $love-primary;
  color: #fff;
}
</style>
