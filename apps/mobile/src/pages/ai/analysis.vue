<template>
  <view class="page">
    <view class="hero love-card">
      <text class="emoji">📊</text>
      <text class="t">恋爱关系分析</text>
      <text class="d">沟通 · 陪伴 · 安全感 · 仪式感 多维评分</text>
    </view>

    <view class="love-btn love-btn-primary" @tap="load">
      {{ loading ? '分析中...' : report ? '重新分析' : '开始分析' }}
    </view>

    <view v-if="report" class="card love-card">
      <view v-for="s in scores" :key="s.label" class="score-row">
        <text class="label">{{ s.label }}</text>
        <view class="bar-wrap">
          <view class="bar" :style="{ width: s.value + '%' }" />
        </view>
        <text class="num">{{ s.value }}</text>
      </view>

      <view class="risk" v-if="report.riskHint || report.risk">
        <text class="blk-title">⚠️ 风险提醒</text>
        <text class="txt">{{ report.riskHint || report.risk }}</text>
      </view>

      <view class="block">
        <text class="blk-title">总结</text>
        <text class="txt">{{ report.summary }}</text>
      </view>
      <view class="block">
        <text class="blk-title">改善建议</text>
        <text class="txt sug">{{ report.suggestion }}</text>
      </view>
      <view class="love-btn love-btn-outline" @tap="goChat">和恋恋深入聊聊</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { generateAiReport, getAiReport } from '@/api/ai';

const report = ref<Record<string, unknown> | null>(null);
const loading = ref(false);

const scores = computed(() => {
  if (!report.value) return [];
  const r = report.value;
  return [
    { label: '情绪稳定', value: Number(r.emotionScore) || 0 },
    { label: '亲密程度', value: Number(r.intimacyScore) || 0 },
    { label: '沟通质量', value: Number(r.communicationScore) || 0 },
    { label: '综合指数', value: Number(r.totalScore) || 0 },
  ];
});

async function load() {
  loading.value = true;
  try {
    const { reportId } = await generateAiReport({ type: 'analysis' });
    report.value = (await getAiReport(reportId)) as Record<string, unknown>;
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '分析失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

function goChat() {
  uni.navigateTo({ url: '/pages/ai/chat' });
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
.emoji {
  font-size: 64rpx;
  display: block;
}
.hero .t {
  font-size: 36rpx;
  font-weight: 700;
  margin-top: 12rpx;
  display: block;
}
.hero .d {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
  display: block;
}
.card {
  margin-top: 24rpx;
  padding: 28rpx;
}
.score-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.label {
  width: 140rpx;
  font-size: 26rpx;
}
.bar-wrap {
  flex: 1;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin: 0 12rpx;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, $love-primary, #ff9ec0);
}
.num {
  width: 56rpx;
  text-align: right;
  font-weight: 700;
  color: $love-primary;
}
.risk {
  background: #fff8e6;
  padding: 20rpx;
  border-radius: 12rpx;
  margin: 20rpx 0;
}
.block {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $love-border;
}
.blk-title {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}
.txt {
  font-size: 28rpx;
  line-height: 1.6;
  display: block;
}
.sug {
  color: $love-primary;
}
.love-btn-outline {
  margin-top: 28rpx;
}
</style>
