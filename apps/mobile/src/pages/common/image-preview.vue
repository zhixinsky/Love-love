<template>
  <view class="page">
    <swiper v-if="urls.length" class="swiper" :current="current" @change="onSwipe">
      <swiper-item v-for="(u, i) in urls" :key="i">
        <image :src="u" mode="widthFix" class="img" @longpress="save(u)" />
      </swiper-item>
    </swiper>
    <image v-else-if="url" :src="url" mode="widthFix" class="img" @longpress="save(url)" />
    <text v-if="urls.length > 1" class="indicator">{{ current + 1 }} / {{ urls.length }}</text>
    <text class="hint">长按保存到相册</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const url = ref('');
const urls = ref<string[]>([]);
const current = ref(0);

const pages = getCurrentPages();
const cur = pages[pages.length - 1] as {
  options?: { url?: string; urls?: string; index?: string };
};
if (cur?.options?.urls) {
  try {
    urls.value = JSON.parse(decodeURIComponent(cur.options.urls));
    current.value = Number(cur.options.index || 0);
  } catch {
    urls.value = [];
  }
} else if (cur?.options?.url) {
  url.value = decodeURIComponent(cur.options.url);
}

function onSwipe(e: { detail: { current: number } }) {
  current.value = e.detail.current;
}

function save(src: string) {
  if (!src) return;
  uni.downloadFile({
    url: src,
    success: (r) => {
      uni.saveImageToPhotosAlbum({
        filePath: r.tempFilePath,
        success: () => uni.showToast({ title: '已保存', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
      });
    },
    fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
  });
}
</script>

<style scoped>
.page {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.swiper {
  width: 100%;
  height: 80vh;
}
.img {
  width: 100%;
}
.indicator {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  margin-top: 24rpx;
}
.hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
  margin-top: 16rpx;
  padding-bottom: 48rpx;
}
</style>
