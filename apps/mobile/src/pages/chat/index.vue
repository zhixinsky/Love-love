<template>
  <view class="page">
    <view class="top-actions">
      <view class="chip" @tap="goAi">🤖 AI 聊天</view>
      <view class="chip" @tap="goMeet">🍾 漂流瓶</view>
    </view>

    <scroll-view
      scroll-y
      class="list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="s in list"
        :key="s.sessionId"
        class="item love-card"
        @tap="openSession(s)"
      >
        <UserAvatar :src="s.avatar" />
        <view class="body">
          <view class="row">
            <text class="name">{{ s.nickname }}</text>
            <text v-if="s.sessionType === 3" class="tag ai">AI</text>
            <text v-else-if="s.sessionType === 1" class="tag">瓶友</text>
          </view>
          <text class="last">{{ s.lastMessage || '暂无消息' }}</text>
        </view>
        <view class="right">
          <text class="time">{{ formatRelative(s.lastMessageTime) }}</text>
          <text v-if="s.unreadCount > 0" class="badge">
            {{ s.unreadCount > 99 ? '99+' : s.unreadCount }}
          </text>
        </view>
      </view>
      <EmptyState v-if="!loading && !list.length" text="暂无会话" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getSessionList } from '@/api/chat';
import EmptyState from '@/components/EmptyState.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
import { formatRelative } from '@/utils/format';

const { checkLogin } = useAuthRedirect();
const list = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);

onShow(() => {
  if (!checkLogin()) return;
  load();
});

async function load() {
  loading.value = true;
  try {
    const res = await getSessionList();
    list.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await load();
  refreshing.value = false;
}

function goAi() {
  uni.navigateTo({ url: '/pages/ai/chat' });
}
function goMeet() {
  uni.switchTab({ url: '/pages/meet/index' });
}

function openSession(s: {
  sessionId: string | number;
  sessionType?: number;
  targetUserId?: string;
}) {
  if (s.sessionType === 3) {
    uni.navigateTo({ url: '/pages/ai/chat' });
    return;
  }
  const tid = s.targetUserId ? `&targetUserId=${s.targetUserId}` : '';
  uni.navigateTo({
    url: `/pages/chat/detail?sessionId=${s.sessionId}${tid}`,
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $love-bg;
}
.top-actions {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  flex-shrink: 0;
}
.chip {
  padding: 12rpx 24rpx;
  background: #fff;
  border-radius: 32rpx;
  font-size: 26rpx;
}
.list {
  flex: 1;
  height: 0;
  padding: 0 24rpx 24rpx;
}
.item {
  display: flex;
  padding: 24rpx;
  margin-bottom: 16rpx;
  align-items: center;
}
.body {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.name {
  font-weight: 600;
  font-size: 30rpx;
}
.tag {
  font-size: 20rpx;
  background: #e8f4ff;
  color: #5b9bd5;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}
.tag.ai {
  background: $love-primary-light;
  color: $love-primary;
}
.last {
  font-size: 24rpx;
  color: $love-text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  margin-top: 6rpx;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.time {
  font-size: 22rpx;
  color: $love-text-muted;
}
.badge {
  margin-top: 8rpx;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  background: $love-primary;
  color: #fff;
  font-size: 20rpx;
  border-radius: 18rpx;
  padding: 0 8rpx;
}
</style>
