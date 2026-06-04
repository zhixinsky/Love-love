<template>
  <view class="page">
    <input v-model="title" class="love-input title-inp" placeholder="标题（可选）" maxlength="50" />
    <textarea
      v-model="content"
      class="love-input content"
      placeholder="写下今天的故事、心情与细节..."
      maxlength="5000"
    />
    <text class="count">{{ content.length }}/5000</text>

    <UploadImage v-model="images" scene="diary" :max="9" />

    <text class="label">心情</text>
    <view class="chips">
      <text
        v-for="m in MOOD_OPTIONS"
        :key="m.label"
        class="chip"
        :class="{ on: mood === m.label }"
        @tap="mood = m.label"
      >{{ m.emoji }} {{ m.label }}</text>
    </view>

    <text class="label">天气</text>
    <view class="chips">
      <text
        v-for="w in WEATHER_OPTIONS"
        :key="w"
        class="chip sm"
        :class="{ on: weather === w }"
        @tap="weather = w"
      >{{ w }}</text>
    </view>

    <input v-model="location" class="love-input" placeholder="位置（可选）" />

    <picker :range="visLabels" :value="visIndex" @change="onVis">
      <view class="love-input picker">可见范围：{{ visLabels[visIndex] }}</view>
    </picker>

    <view class="love-btn love-btn-primary" @tap="save">
      {{ saving ? '保存中...' : id ? '更新日记' : '发布日记' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MOOD_OPTIONS, WEATHER_OPTIONS } from '@/constants/mood';
import { createDiary, getDiaryDetail, updateDiary } from '@/api/diary';
import UploadImage from '@/components/UploadImage.vue';

const id = ref('');
const title = ref('');
const content = ref('');
const mood = ref('开心');
const weather = ref('晴');
const location = ref('');
const images = ref<string[]>([]);
const saving = ref(false);
const visLabels = ['仅自己', '情侣可见', '公开广场'];
const visIndex = ref(1);

const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
if (cur?.options?.id) {
  id.value = cur.options.id;
  load();
}

async function load() {
  const d = await getDiaryDetail(id.value);
  title.value = d.title || '';
  content.value = d.content || '';
  mood.value = d.mood || '开心';
  weather.value = (d.weather as string) || '晴';
  visIndex.value = Math.max(0, (d.visibility as number) - 1);
  images.value = (d.mediaList as { url: string }[])?.map((m) => m.url) || [];
}

function onVis(e: { detail: { value: string } }) {
  visIndex.value = Number(e.detail.value);
}

async function save() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请填写正文', icon: 'none' });
    return;
  }
  const payload = {
    title: title.value,
    content: content.value,
    mood: mood.value,
    weather: weather.value,
    location: location.value,
    visibility: visIndex.value + 1,
    mediaList: images.value.map((url, i) => ({
      mediaType: 1,
      url,
      sort: i + 1,
    })),
  };
  saving.value = true;
  try {
    if (id.value) await updateDiary(id.value, payload);
    else await createDiary(payload);
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '保存失败',
      icon: 'none',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  padding-bottom: 48rpx;
  background: $love-bg;
  min-height: 100vh;
}
.title-inp {
  font-size: 32rpx;
  font-weight: 600;
}
.content {
  min-height: 320rpx;
  margin-top: 12rpx;
}
.count {
  text-align: right;
  font-size: 22rpx;
  color: $love-text-muted;
  margin-bottom: 16rpx;
  display: block;
}
.label {
  font-size: 26rpx;
  font-weight: 600;
  margin: 20rpx 0 12rpx;
  display: block;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.chip {
  padding: 10rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
}
.chip.sm {
  padding: 8rpx 24rpx;
}
.chip.on {
  background: $love-primary;
  color: #fff;
}
.picker {
  margin-top: 16rpx;
}
</style>
