<template>
  <view class="page">
    <text class="label">纪念日名称</text>
    <input v-model="title" class="love-input" placeholder="如：在一起、TA的生日" maxlength="30" />

    <text class="label">日期</text>
    <picker mode="date" @change="onDate">
      <view class="picker love-input">
        {{ date || '点击选择日期' }}
      </view>
    </picker>

    <text class="label">提醒</text>
    <view class="chips">
      <text
        v-for="p in presets"
        :key="p"
        class="chip"
        :class="{ on: title === p }"
        @tap="title = p"
      >{{ p }}</text>
    </view>

    <view class="love-btn love-btn-primary" @tap="save">{{ saving ? '保存中...' : '保存纪念日' }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createAnniversary } from '@/api/anniversary';

const title = ref('');
const date = ref('');
const saving = ref(false);
const presets = ['在一起', '第一次约会', 'TA的生日', '情人节'];

function onDate(e: { detail: { value: string } }) {
  date.value = e.detail.value;
}

async function save() {
  if (!title.value || !date.value) {
    uni.showToast({ title: '请填写完整', icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    await createAnniversary({ title: title.value, anniversaryDate: date.value });
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
.picker {
  color: $love-text;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 16rpx 0 32rpx;
}
.chip {
  padding: 12rpx 24rpx;
  background: #fff;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: $love-text-muted;
}
.chip.on {
  background: $love-primary;
  color: #fff;
}
.love-btn {
  margin-top: 24rpx;
}
</style>
