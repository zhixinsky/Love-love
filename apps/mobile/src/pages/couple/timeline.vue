<template>
  <view class="page">
    <text class="intro">恋爱时间轴 · 日记与纪念日的一同见证</text>
    <EmptyState v-if="!list.length && !loading" text="绑定情侣后，内容会出现在这里" />
    <view v-for="(item, i) in list" :key="i" class="line" @tap="open(item)">
      <view class="dot" :class="item.kind" />
      <view class="card love-card">
        <text class="kind-label">{{ item.kindLabel }}</text>
        <text class="d">{{ item.date }}</text>
        <text class="text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import { getAnniversaryList } from '@/api/anniversary';
import EmptyState from '@/components/EmptyState.vue';

type Row = {
  date: string;
  text: string;
  kind: 'diary' | 'anniversary';
  kindLabel: string;
  id?: string;
};

const list = ref<Row[]>([]);
const loading = ref(false);

onShow(() => load());

async function load() {
  loading.value = true;
  try {
    const [d, a] = await Promise.all([
      getDiaryList({ page: 1, pageSize: 30 }),
      getAnniversaryList().catch(() => ({ list: [] })),
    ]);
    const rows: Row[] = [];
    ((d.list as any[]) || []).forEach((x) =>
      rows.push({
        date: String(x.createdAt).slice(0, 10),
        text: x.title || String(x.content || '').slice(0, 48),
        kind: 'diary',
        kindLabel: '📔 日记',
        id: x.id,
      }),
    );
    ((a.list as any[]) || []).forEach((x) =>
      rows.push({
        date: x.anniversaryDate,
        text: x.title,
        kind: 'anniversary',
        kindLabel: '📅 纪念日',
        id: x.id,
      }),
    );
    list.value = rows.sort((x, y) => y.date.localeCompare(x.date));
  } finally {
    loading.value = false;
  }
}

function open(item: Row) {
  if (item.kind === 'diary' && item.id) {
    uni.navigateTo({ url: '/pages/diary/detail?id=' + item.id });
  } else if (item.kind === 'anniversary') {
    uni.navigateTo({ url: '/pages/anniversary/index' });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx 24rpx 24rpx 56rpx;
  background: $love-bg;
  min-height: 100vh;
}
.intro {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-bottom: 24rpx;
  display: block;
  margin-left: -24rpx;
}
.line {
  position: relative;
  padding-left: 32rpx;
  margin-bottom: 24rpx;
  border-left: 4rpx solid $love-primary;
}
.dot {
  position: absolute;
  left: -12rpx;
  top: 12rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: $love-primary;
}
.dot.anniversary {
  background: #ffb347;
}
.card {
  padding: 20rpx;
}
.kind-label {
  font-size: 22rpx;
  color: $love-primary;
  display: block;
}
.d {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 4rpx;
  display: block;
}
.text {
  font-size: 28rpx;
  margin-top: 8rpx;
  display: block;
  line-height: 1.4;
}
</style>
