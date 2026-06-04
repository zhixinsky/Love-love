<template>
  <view class="page">
    <text class="label">愿望是什么？</text>
    <input v-model="title" class="love-input" placeholder="例如：一起去海边看日出" maxlength="50" />
    <text class="label">补充说明（可选）</text>
    <textarea
      v-model="desc"
      class="love-input area"
      placeholder="计划、时间或一起完成的小仪式..."
      maxlength="200"
    />
    <view class="love-btn love-btn-primary" @tap="save">{{ saving ? '保存中...' : '加入清单' }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createWish } from '@/api/wish';

const title = ref('');
const desc = ref('');
const saving = ref(false);

async function save() {
  if (!title.value.trim()) {
    uni.showToast({ title: '请填写愿望', icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    await createWish({ title: title.value, description: desc.value });
    uni.showToast({ title: '已添加', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 400);
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 32rpx;
  background: $love-bg;
  min-height: 100vh;
}
.label {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}
.area {
  min-height: 240rpx;
  margin-top: 16rpx;
}
.love-btn {
  margin-top: 40rpx;
}
</style>
