<template>
  <view class="page">
    <text class="head">情侣相册 · {{ imgs.length }} 张</text>
    <EmptyState v-if="!imgs.length && !loading" text="公开日记里的图片会汇总到这里" />
    <view v-for="(group, month) in grouped" :key="month" class="section">
      <text class="month">{{ month }}</text>
      <view class="grid">
        <image
          v-for="(u, i) in group"
          :key="month + i"
          :src="u"
          mode="aspectFill"
          class="cell"
          @tap="preview(group, i)"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';

const imgs = ref<{ url: string; month: string }[]>([]);
const loading = ref(false);

const grouped = computed(() => {
  const map: Record<string, string[]> = {};
  imgs.value.forEach((x) => {
    if (!map[x.month]) map[x.month] = [];
    map[x.month].push(x.url);
  });
  return map;
});

onShow(async () => {
  loading.value = true;
  try {
    const res = await getDiaryList({ page: 1, pageSize: 50 });
    const arr: { url: string; month: string }[] = [];
    ((res.list as any[]) || []).forEach((x) => {
      const month = String(x.createdAt || '').slice(0, 7) || '未知';
      ((x.mediaList as { url: string }[]) || []).forEach((m) =>
        arr.push({ url: m.url, month }),
      );
    });
    imgs.value = arr;
  } finally {
    loading.value = false;
  }
});

function preview(urls: string[], index: number) {
  uni.navigateTo({
    url: `/pages/couple/album-detail?urls=${encodeURIComponent(urls.join(','))}&index=${index}`,
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
.head {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}
.section {
  margin-bottom: 32rpx;
}
.month {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-bottom: 12rpx;
  display: block;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.cell {
  width: 228rpx;
  height: 228rpx;
  border-radius: 12rpx;
}
</style>
