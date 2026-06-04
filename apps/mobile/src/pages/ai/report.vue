<template>
  <view class="page">
    <view class="hero love-card">
      <text class="hero-t">恋爱周报</text>
      <text class="hero-s">基于日记与互动，每周生成幸福指数报告</text>
    </view>

    <view class="metrics love-card" v-if="report">
      <view class="big-score">
        <text class="num">{{ report.totalScore }}</text>
        <text class="lbl">幸福指数</text>
      </view>
      <view class="grid">
        <view class="cell">
          <text class="n">{{ report.diaryCount ?? '—' }}</text>
          <text class="l">本周日记</text>
        </view>
        <view class="cell">
          <text class="n">{{ report.interactionCount ?? '—' }}</text>
          <text class="l">互动次数</text>
        </view>
        <view class="cell">
          <text class="n">{{ report.photoCount ?? report.emotionScore }}</text>
          <text class="l">照片/情绪</text>
        </view>
      </view>
    </view>

    <view class="love-btn love-btn-primary" @tap="gen">
      {{ generating ? 'AI 生成中...' : report ? '重新生成' : '生成本周周报' }}
    </view>

    <view v-if="report" class="card love-card">
      <view class="dim" v-for="d in dims" :key="d.label">
        <text>{{ d.label }}</text>
        <view class="bar"><view class="fill" :style="{ width: d.value + '%' }" /></view>
        <text class="v">{{ d.value }}</text>
      </view>
      <text class="sum-title">本周总结</text>
      <text class="sum">{{ report.summary }}</text>
      <text class="sug">💡 {{ report.suggestion }}</text>
      <view class="love-btn love-btn-outline" @tap="onShare">复制分享文案</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { generateAiReport, getAiReport } from '@/api/ai';

const report = ref<any>(null);
const generating = ref(false);

const dims = computed(() =>
  report.value
    ? [
        { label: '情绪', value: Number(report.value.emotionScore) || 0 },
        { label: '亲密', value: Number(report.value.intimacyScore) || 0 },
        { label: '沟通', value: Number(report.value.communicationScore) || 0 },
      ]
    : [],
);

async function gen() {
  generating.value = true;
  try {
    const { reportId } = await generateAiReport();
    report.value = await getAiReport(reportId);
    uni.showToast({ title: '周报已生成', icon: 'success' });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '生成失败',
      icon: 'none',
    });
  } finally {
    generating.value = false;
  }
}

function onShare() {
  if (!report.value) return;
  const text = `【恋恋恋爱周报】幸福指数 ${report.value.totalScore}\n${report.value.summary}\n${report.value.suggestion}`;
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
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
.hero {
  text-align: center;
  padding: 36rpx;
  margin-bottom: 20rpx;
}
.hero-t {
  font-size: 40rpx;
  font-weight: 700;
  color: $love-primary;
  display: block;
}
.hero-s {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.metrics {
  padding: 32rpx;
  margin-bottom: 20rpx;
}
.big-score {
  text-align: center;
  margin-bottom: 24rpx;
}
.num {
  font-size: 72rpx;
  font-weight: 700;
  color: $love-primary;
}
.lbl {
  font-size: 26rpx;
  color: $love-text-muted;
  display: block;
}
.grid {
  display: flex;
  justify-content: space-around;
}
.cell {
  text-align: center;
}
.n {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.l {
  font-size: 22rpx;
  color: $love-text-muted;
}
.card {
  margin-top: 24rpx;
  padding: 28rpx;
}
.dim {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 26rpx;
}
.bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  margin: 0 12rpx;
  border-radius: 6rpx;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: $love-primary;
}
.v {
  width: 48rpx;
  text-align: right;
  color: $love-primary;
  font-weight: 600;
}
.sum-title {
  font-weight: 600;
  margin-top: 24rpx;
  display: block;
}
.sum,
.sug {
  font-size: 28rpx;
  line-height: 1.6;
  margin-top: 12rpx;
  display: block;
}
</style>
