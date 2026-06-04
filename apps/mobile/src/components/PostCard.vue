<template>
  <view class="post-card love-card" @tap="$emit('tap')">
    <view class="head">
      <UserAvatar :src="post.author?.avatar" />
      <text class="name">{{ post.author?.nickname }}</text>
    </view>
    <text class="content">{{ post.content }}</text>
    <view v-if="post.mediaList?.length" class="media">
      <image
        v-for="(m, i) in post.mediaList.slice(0, 3)"
        :key="i"
        :src="m.url"
        mode="aspectFill"
        class="media-img"
      />
    </view>
    <view class="actions" @tap.stop>
      <text :class="{ active: post.isLiked }" @tap="$emit('like')">
        {{ post.isLiked ? '❤️' : '🤍' }} {{ post.likeCount }}
      </text>
      <text @tap="$emit('comment')">💬 {{ post.commentCount }}</text>
      <text :class="{ active: post.isCollected }" @tap="$emit('collect')">
        ⭐ {{ post.collectCount ?? 0 }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';

defineProps<{
  post: {
    content: string;
    author?: { nickname?: string; avatar?: string };
    mediaList?: { url: string }[];
    likeCount: number;
    commentCount: number;
    collectCount?: number;
    isLiked?: boolean;
    isCollected?: boolean;
  };
}>();

defineEmits<{ tap: []; like: []; comment: []; collect: [] }>();
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.name {
  margin-left: 16rpx;
  font-weight: 600;
}
.content {
  line-height: 1.6;
  font-size: 28rpx;
}
.media {
  display: flex;
  gap: 8rpx;
  margin-top: 16rpx;
}
.media-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}
.actions {
  margin-top: 20rpx;
  display: flex;
  gap: 32rpx;
  font-size: 26rpx;
  color: $love-text-muted;
}
.active {
  color: $love-primary;
}
</style>
