<template>
  <view class="page">
    <textarea
      v-model="content"
      class="love-input area"
      placeholder="分享此刻的心情、故事或照片..."
      maxlength="2000"
    />
    <text class="count">{{ content.length }}/2000</text>

    <UploadImage v-model="images" scene="post" :max="9" />

    <text class="label">话题（可选）</text>
    <view class="chips">
      <text
        v-for="t in topics"
        :key="t"
        class="chip"
        :class="{ on: topic === t }"
        @tap="topic = topic === t ? '' : t"
      >#{{ t }}</text>
    </view>

    <input v-model="city" class="love-input" placeholder="所在城市（附近频道展示）" />

    <view class="love-btn love-btn-primary" @tap="submit">
      {{ submitting ? '发布中...' : '发布到广场' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createPost } from '@/api/post';
import UploadImage from '@/components/UploadImage.vue';

const content = ref('');
const city = ref('');
const topic = ref('');
const images = ref<string[]>([]);
const submitting = ref(false);
const topics = ['恋爱日常', '异地恋', '纪念日', '求助', '甜蜜瞬间'];

async function submit() {
  if (!content.value.trim() && !images.value.length) {
    uni.showToast({ title: '请填写内容或添加图片', icon: 'none' });
    return;
  }
  const text = topic.value
    ? `#${topic.value} ${content.value}`
    : content.value;
  submitting.value = true;
  try {
    const res = (await createPost({
      content: text,
      city: city.value,
      mediaList: images.value.map((url, i) => ({
        mediaType: 1,
        url,
        sort: i + 1,
      })),
    })) as { message?: string };
    uni.showToast({ title: res.message || '发布成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/post/index' }), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '发布失败',
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
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.area {
  min-height: 240rpx;
}
.count {
  text-align: right;
  font-size: 22rpx;
  color: $love-text-muted;
  margin: -8rpx 0 20rpx;
  display: block;
}
.label {
  font-size: 26rpx;
  font-weight: 600;
  margin: 16rpx 0 12rpx;
  display: block;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.chip {
  padding: 10rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $love-text-muted;
}
.chip.on {
  background: $love-primary;
  color: #fff;
}
</style>
