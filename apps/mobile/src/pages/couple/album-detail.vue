<template>
  <view class="page">
    <swiper class="sw" :current="current" @change="onSwipe">
      <swiper-item v-for="(u, i) in urls" :key="i">
        <image :src="u" mode="aspectFit" class="img" @longpress="save(u)" />
      </swiper-item>
    </swiper>
    <view class="bar">
      <text class="idx">{{ current + 1 }} / {{ urls.length }}</text>
      <text class="act" @tap="save(urls[current])">保存</text>
      <text class="act" @tap="previewAll">全屏</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const urls = ref<string[]>([]);
const current = ref(0);

const pages = getCurrentPages();
const cur = pages[pages.length - 1] as {
  options?: { urls?: string; index?: string };
};
if (cur?.options?.urls) {
  urls.value = decodeURIComponent(cur.options.urls).split(',');
  current.value = Number(cur.options.index || 0);
}

function onSwipe(e: { detail: { current: number } }) {
  current.value = e.detail.current;
}

function save(src: string) {
  if (!src) return;
  uni.downloadFile({
    url: src,
    success: (r) =>
      uni.saveImageToPhotosAlbum({
        filePath: r.tempFilePath,
        success: () => uni.showToast({ title: '已保存', icon: 'success' }),
      }),
  });
}

function previewAll() {
  uni.previewImage({ urls: urls.value, current: urls.value[current.value] });
}
</script>

<style scoped>
.page {
  background: #000;
  min-height: 100vh;
}
.sw {
  height: calc(100vh - 100rpx);
}
.img {
  width: 100%;
  height: 100%;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  color: rgba(255, 255, 255, 0.85);
}
.idx {
  font-size: 26rpx;
}
.act {
  font-size: 28rpx;
  margin-left: 32rpx;
}
</style>
