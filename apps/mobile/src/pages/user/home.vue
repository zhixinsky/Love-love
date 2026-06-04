<template>
  <view class="page" v-if="user">
    <view class="cover">
      <image :src="user.avatar || '/static/default-avatar.png'" class="av" mode="aspectFill" />
      <text class="name">{{ user.nickname }}</text>
      <text v-if="user.city" class="city">📍 {{ user.city }}</text>
      <text class="bio">{{ user.bio || '这个人很神秘，什么都没写' }}</text>
    </view>

    <view class="stats love-card">
      <view class="stat">
        <text class="n">{{ user.stats?.postCount ?? 0 }}</text>
        <text class="l">动态</text>
      </view>
      <view class="stat">
        <text class="n">{{ user.stats?.diaryCount ?? 0 }}</text>
        <text class="l">日记</text>
      </view>
      <view class="stat">
        <text class="n">{{ user.stats?.fansCount ?? 0 }}</text>
        <text class="l">粉丝</text>
      </view>
    </view>

    <view class="actions">
      <view class="love-btn love-btn-primary" @tap="follow">
        {{ user.isFollowed ? '已关注' : '+ 关注' }}
      </view>
      <view
        class="love-btn love-btn-outline"
        :class="{ disabled: !user.canMessage }"
        @tap="chat"
      >
        {{ user.canMessage ? '私信' : '暂不可私信' }}
      </view>
    </view>

    <view class="tabs">
      <text class="tab" :class="{ on: tab === 'post' }" @tap="tab = 'post'">动态</text>
      <text class="tab" :class="{ on: tab === 'about' }" @tap="tab = 'about'">简介</text>
    </view>

    <view v-if="tab === 'post'">
      <view v-if="loadingPosts" class="tip">加载中...</view>
      <EmptyState v-else-if="!posts.length" text="暂无公开动态" />
      <PostCard v-for="p in posts" :key="p.id" :post="p" @tap="goPost(p.id)" />
    </view>
    <view v-else class="about love-card">
      <text class="line">城市：{{ user.city || '未填写' }}</text>
      <text class="line hint" v-if="!user.canMessage">
        对方已关闭陌生人私信，关注后可尝试聊天
      </text>
      <text class="link" @tap="report">举报该用户</text>
    </view>
  </view>
  <view v-else-if="loading" class="loading">加载中...</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createChatSession } from '@/api/chat';
import { getPublicUser, getPublicUserPosts, toggleFollow } from '@/api/user';
import { submitReport } from '@/api/report';
import EmptyState from '@/components/EmptyState.vue';
import PostCard from '@/components/PostCard.vue';
import type { PublicUserProfile } from '@/types/user';

const user = ref<PublicUserProfile | null>(null);
const posts = ref<any[]>([]);
const loading = ref(true);
const loadingPosts = ref(false);
const tab = ref<'post' | 'about'>('post');
const userId = ref('');

const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
if (cur?.options?.id) {
  userId.value = cur.options.id;
  load(cur.options.id);
}

async function load(id: string) {
  loading.value = true;
  try {
    user.value = await getPublicUser(id);
    uni.setNavigationBarTitle({ title: String(user.value.nickname || '用户主页') });
    if (tab.value === 'post') loadPosts(id);
  } catch {
    user.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadPosts(uid: string) {
  loadingPosts.value = true;
  try {
    const res = await getPublicUserPosts(uid, { page: 1, pageSize: 30 });
    posts.value = (res.list as any[]) || [];
  } finally {
    loadingPosts.value = false;
  }
}

async function follow() {
  if (!user.value) return;
  const res = await toggleFollow(Number(user.value.id));
  uni.showToast({ title: res.followed ? '已关注' : '已取消', icon: 'none' });
  await refreshProfile();
}

async function refreshProfile() {
  if (!userId.value) return;
  try {
    const p = await getPublicUser(userId.value);
    user.value = { ...user.value!, ...p };
  } catch {
    /* ignore */
  }
}

async function chat() {
  if (!user.value?.canMessage) {
    uni.showToast({ title: '需互相关注后才能私信', icon: 'none' });
    return;
  }
  const id = user.value.id;
  try {
    uni.showLoading({ title: '连接中' });
    const res = await createChatSession(id as string | number);
    uni.navigateTo({
      url: `/pages/chat/detail?sessionId=${res.sessionId}&targetUserId=${res.targetUserId}`,
    });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '无法发起私信',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
  }
}

function goPost(id: string | number) {
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` });
}

function report() {
  uni.showModal({
    title: '举报用户',
    editable: true,
    placeholderText: '简要说明',
    success: async (r) => {
      if (!r.confirm || !user.value) return;
      await submitReport({
        targetType: 2,
        targetId: Number(user.value.id),
        reasonType: 1,
        reason: r.content || '不良行为',
      });
      uni.showToast({ title: '已提交', icon: 'success' });
    },
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  min-height: 100vh;
  background: $love-bg;
  padding-bottom: 48rpx;
}
.cover {
  background: linear-gradient(180deg, #ffe8f0, $love-bg);
  padding: 48rpx 32rpx 32rpx;
  text-align: center;
}
.av {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
  margin-top: 20rpx;
}
.city {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.bio {
  font-size: 28rpx;
  color: $love-text-muted;
  margin-top: 16rpx;
  line-height: 1.5;
  display: block;
  padding: 0 24rpx;
}
.stats {
  display: flex;
  margin: 0 24rpx 20rpx;
  padding: 28rpx 0;
}
.stat {
  flex: 1;
  text-align: center;
}
.n {
  font-size: 36rpx;
  font-weight: 700;
  color: $love-primary;
  display: block;
}
.l {
  font-size: 24rpx;
  color: $love-text-muted;
}
.actions {
  padding: 0 24rpx;
  display: flex;
  gap: 16rpx;
}
.actions .love-btn {
  flex: 1;
  margin: 0;
}
.actions .disabled {
  opacity: 0.5;
}
.tabs {
  display: flex;
  margin: 32rpx 24rpx 16rpx;
  gap: 24rpx;
}
.tab {
  font-size: 30rpx;
  color: $love-text-muted;
  padding-bottom: 8rpx;
}
.tab.on {
  color: $love-primary;
  font-weight: 600;
  border-bottom: 4rpx solid $love-primary;
}
.about {
  margin: 0 24rpx;
  padding: 28rpx;
}
.line {
  display: block;
  font-size: 28rpx;
  margin-bottom: 12rpx;
}
.line.hint {
  color: $love-text-muted;
  font-size: 24rpx;
}
.link {
  display: block;
  margin-top: 24rpx;
  color: $love-text-muted;
  font-size: 26rpx;
}
.tip {
  text-align: center;
  padding: 40rpx;
  color: $love-text-muted;
}
.loading {
  text-align: center;
  padding: 80rpx;
  color: $love-text-muted;
}
</style>
