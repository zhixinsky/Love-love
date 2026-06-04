<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <template v-else-if="bottle">
      <view class="author love-card">
        <image
          :src="(bottle.author as any)?.avatar || '/static/default-avatar.png'"
          class="av"
        />
        <view>
          <text class="name">{{ (bottle.author as any)?.nickname }}</text>
          <text class="meta">{{ bottle.city || '来自远方' }} · {{ formatRelative(bottle.createdAt as string) }}</text>
        </view>
        <text class="tag">{{ bottle.statusLabel }}</text>
      </view>

      <view class="content-card love-card">
        <text class="quote">"</text>
        <text class="text">{{ bottle.content }}</text>
      </view>

      <view class="reply-box">
        <text class="label">你的回复</text>
        <textarea
          v-model="reply"
          class="love-input area"
          placeholder="写一句温暖的话，开启私聊..."
          maxlength="500"
        />
        <text class="count">{{ reply.length }}/500</text>
      </view>

      <view class="love-btn love-btn-primary" @tap="sendReply">回复并开聊</view>
      <view class="love-btn love-btn-outline" @tap="pickAgain">再捞一个</view>
    </template>
    <EmptyState v-else text="瓶子已漂走" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getBottleDetail, pickBottle, replyBottle } from '@/api/bottle';
import EmptyState from '@/components/EmptyState.vue';
import { formatRelative } from '@/utils/format';

const bottle = ref<Record<string, unknown> | null>(null);
const reply = ref('');
const loading = ref(true);
const bottleId = ref('');

onMounted(() => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as { options?: { id?: string } };
  bottleId.value = cur?.options?.id || '';
  if (bottleId.value) loadDetail();
  else pickAgain();
});

async function loadDetail() {
  loading.value = true;
  try {
    bottle.value = (await getBottleDetail(bottleId.value)) as Record<string, unknown>;
  } catch {
    bottle.value = null;
  } finally {
    loading.value = false;
  }
}

async function sendReply() {
  if (!reply.value.trim() || !bottle.value?.id) return;
  const res = (await replyBottle({
    bottleId: bottle.value.id,
    content: reply.value,
  })) as { sessionId?: string | number };
  uni.showToast({ title: '已回复', icon: 'success' });
  const sid = res.sessionId;
  if (sid) {
    setTimeout(
      () =>
        uni.navigateTo({
          url: `/pages/chat/detail?sessionId=${sid}`,
        }),
      400,
    );
  } else {
    setTimeout(() => uni.navigateTo({ url: '/pages/chat/index' }), 400);
  }
}

async function pickAgain() {
  loading.value = true;
  try {
    bottle.value = (await pickBottle()) as Record<string, unknown>;
    bottleId.value = String(bottle.value.id);
    reply.value = '';
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '暂无瓶子',
      icon: 'none',
    });
    bottle.value = null;
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: linear-gradient(180deg, #e8f4ff 0%, $love-bg 40%);
  min-height: 100vh;
}
.loading {
  text-align: center;
  padding: 80rpx;
  color: $love-text-muted;
}
.author {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.av {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.name {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.meta {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.tag {
  margin-left: auto;
  font-size: 22rpx;
  color: #5b9bd5;
  background: #e8f4ff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.content-card {
  padding: 32rpx;
  position: relative;
}
.quote {
  font-size: 64rpx;
  color: #5b9bd5;
  opacity: 0.3;
  line-height: 1;
}
.text {
  font-size: 32rpx;
  line-height: 1.7;
  display: block;
  margin-top: -20rpx;
}
.reply-box {
  margin: 28rpx 0;
}
.label {
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}
.area {
  min-height: 180rpx;
}
.count {
  font-size: 22rpx;
  color: $love-text-muted;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}
.love-btn {
  margin-bottom: 16rpx;
}
</style>
