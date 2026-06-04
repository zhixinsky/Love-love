<template>
  <view class="page">
    <view v-if="loading" class="tip">加载中...</view>
    <template v-else-if="post">
      <view class="author love-card" @tap="goAuthor">
        <UserAvatar :src="post.author?.avatar" />
        <view class="info">
          <text class="name">{{ post.author?.nickname }}</text>
          <text class="meta">{{ formatRelative(post.createdAt) }} · {{ post.city || '恋恋' }}</text>
        </view>
      </view>

      <view class="content-card love-card">
        <text class="text">{{ post.content }}</text>
        <view v-if="post.mediaList?.length" class="gallery">
          <image
            v-for="(m, i) in post.mediaList"
            :key="i"
            :src="m.url"
            mode="aspectFill"
            class="g-img"
            @tap="previewImage(i)"
          />
        </view>
      </view>

      <view class="actions love-card">
        <text :class="{ on: post.isLiked }" @tap="onLike">❤️ {{ post.likeCount }}</text>
        <text>💬 {{ post.commentCount }}</text>
        <text :class="{ on: post.isCollected }" @tap="onCollect">⭐ 收藏</text>
        <text class="report" @tap="onReport">举报</text>
      </view>

      <view class="comments love-card">
        <text class="h">评论 {{ comments.length }}</text>
        <EmptyState v-if="!comments.length" text="还没有评论，来抢沙发" />
        <view v-for="c in comments" :key="c.id" class="c-item">
          <text class="cn">{{ c.author?.nickname || '用户' }}</text>
          <text class="cc">{{ c.content }}</text>
          <text class="ct">{{ formatRelative(c.createdAt) }}</text>
        </view>
      </view>

      <view class="bar">
        <input v-model="commentText" class="inp" placeholder="友善评论..." />
        <view class="send" @tap="sendComment">发送</view>
      </view>
    </template>
    <EmptyState v-else text="动态不存在或已删除" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getPostDetail } from '@/api/post';
import { createComment, getCommentList } from '@/api/comment';
import { toggleCollect, toggleLike } from '@/api/like';
import { submitReport } from '@/api/report';
import EmptyState from '@/components/EmptyState.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { formatRelative } from '@/utils/format';

const postId = ref('');
const post = ref<any>(null);
const comments = ref<any[]>([]);
const commentText = ref('');
const loading = ref(true);

onMounted(() => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as { options?: { id?: string } };
  postId.value = cur?.options?.id || '';
  load();
});

async function load() {
  loading.value = true;
  try {
    post.value = await getPostDetail(postId.value);
    const res = await getCommentList({
      targetType: 1,
      targetId: Number(postId.value),
      page: 1,
      pageSize: 50,
    });
    comments.value = res.list || [];
  } catch {
    post.value = null;
  } finally {
    loading.value = false;
  }
}

function goAuthor() {
  const id = post.value?.author?.id || post.value?.userId;
  if (id) uni.navigateTo({ url: `/pages/user/home?id=${id}` });
}

function previewImage(index: number) {
  const urls = (post.value?.mediaList || []).map((m: { url: string }) => m.url);
  uni.navigateTo({
    url: `/pages/common/image-preview?urls=${encodeURIComponent(JSON.stringify(urls))}&index=${index}`,
  });
}

async function onLike() {
  const res = await toggleLike(1, Number(postId.value));
  post.value.isLiked = res.liked;
  post.value.likeCount = res.likeCount;
}

async function onCollect() {
  const res = await toggleCollect(1, Number(postId.value));
  post.value.isCollected = res.collected;
  uni.showToast({ title: res.collected ? '已收藏' : '已取消', icon: 'none' });
}

async function sendComment() {
  if (!commentText.value.trim()) return;
  await createComment({
    targetType: 1,
    targetId: Number(postId.value),
    content: commentText.value,
  });
  commentText.value = '';
  load();
}

function onReport() {
  uni.showActionSheet({
    itemList: ['垃圾广告', '色情低俗', '骚扰辱骂', '其他'],
    success: async (res) => {
      const reasons = ['垃圾广告', '色情低俗', '骚扰辱骂', '其他'];
      await submitReport({
        targetType: 1,
        targetId: Number(postId.value),
        reasonType: res.tapIndex + 1,
        reason: reasons[res.tapIndex] || '其他',
      });
      uni.showToast({ title: '已提交举报', icon: 'success' });
    },
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  padding-bottom: 120rpx;
  background: $love-bg;
  min-height: 100vh;
}
.tip {
  text-align: center;
  padding: 80rpx;
  color: $love-text-muted;
}
.author {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 16rpx;
}
.info {
  margin-left: 16rpx;
}
.name {
  font-weight: 600;
  font-size: 30rpx;
  display: block;
}
.meta {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 4rpx;
  display: block;
}
.content-card {
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.text {
  font-size: 30rpx;
  line-height: 1.65;
  display: block;
}
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}
.g-img {
  width: 210rpx;
  height: 210rpx;
  border-radius: 12rpx;
}
.actions {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
}
.actions .on {
  color: $love-primary;
}
.report {
  color: $love-text-muted;
  font-size: 24rpx;
}
.h {
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}
.c-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid $love-border;
}
.cn {
  font-size: 26rpx;
  font-weight: 600;
  display: block;
}
.cc {
  font-size: 28rpx;
  margin-top: 6rpx;
  display: block;
  line-height: 1.4;
}
.ct {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 16rpx;
  background: #fff;
  gap: 16rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}
.inp {
  flex: 1;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
}
.send {
  line-height: 72rpx;
  color: $love-primary;
  font-weight: 600;
}
</style>
