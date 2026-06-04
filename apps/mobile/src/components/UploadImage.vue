<template>
  <view class="upload-image">
    <view class="grid">
      <view v-for="(url, i) in modelValue" :key="i" class="thumb">
        <image :src="url" mode="aspectFill" class="img" @tap="preview(i)" />
        <text class="del" @tap.stop="remove(i)">×</text>
      </view>
      <view v-if="modelValue.length < max" class="add" @tap="choose">
        <text>+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { uploadImageFile } from '@/utils/upload-file';

const props = withDefaults(
  defineProps<{ modelValue: string[]; max?: number; scene?: string }>(),
  { max: 9, scene: 'diary' },
);
const emit = defineEmits<{ 'update:modelValue': [string[]] }>();

function choose() {
  uni.chooseImage({
    count: props.max - props.modelValue.length,
    success: async (res) => {
      const urls = [...props.modelValue];
      uni.showLoading({ title: '上传中' });
      try {
        for (const path of res.tempFilePaths) {
          const url = await uploadImageFile(path);
          urls.push(url);
        }
        emit('update:modelValue', urls);
      } catch (e: unknown) {
        uni.showToast({
          title: e instanceof Error ? e.message : '上传失败',
          icon: 'none',
        });
      } finally {
        uni.hideLoading();
      }
    },
  });
}

function remove(i: number) {
  const urls = [...props.modelValue];
  urls.splice(i, 1);
  emit('update:modelValue', urls);
}

function preview(i: number) {
  uni.previewImage({ urls: props.modelValue, current: props.modelValue[i] });
}
</script>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.thumb,
.add {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  position: relative;
}
.img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}
.add {
  background: #fff;
  border: 2rpx dashed #ffb3cc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #ff6b9d;
}
.del {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 40rpx;
  height: 40rpx;
  text-align: center;
  border-radius: 0 16rpx 0 8rpx;
}
</style>
