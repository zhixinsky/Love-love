<template>
  <view class="me-page">
    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state">{{ error }}</view>
    <template v-else>
      <!-- 顶部用户卡 -->
      <view class="user-card love-card" @tap="goProfile">
        <UserAvatar :src="home?.user.avatar" class="avatar" />
        <view class="user-info">
          <text class="nickname">{{ home?.user.nickname || '未设置昵称' }}</text>
          <text class="status">{{ loveStatusText }}</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <!-- 情侣区 -->
      <view v-if="home?.couple" class="couple-card love-card" @tap="goCoupleSpace">
        <text class="couple-days">在一起 {{ home.couple.loveDays }} 天</text>
        <text class="couple-partner">与 {{ home.couple.partnerNickname }} 的恋爱空间</text>
      </view>
      <view v-else class="invite-card love-card" @tap="goBind">
        <text class="invite-title">邀请另一半</text>
        <text class="invite-desc">绑定后即可开启情侣空间</text>
        <view class="love-btn love-btn-primary invite-btn">去绑定</view>
      </view>

      <!-- 数据统计 -->
      <view class="stats-row">
        <view class="stat-item" @tap="goMyDiary">
          <text class="stat-num">{{ home?.stats.diaryCount ?? 0 }}</text>
          <text class="stat-label">日记</text>
        </view>
        <view class="stat-item" @tap="goMyPost">
          <text class="stat-num">{{ home?.stats.postCount ?? 0 }}</text>
          <text class="stat-label">动态</text>
        </view>
        <view class="stat-item" @tap="goFollowing">
          <text class="stat-num">{{ home?.stats.followCount ?? 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @tap="goFollowers">
          <text class="stat-num">{{ home?.stats.fansCount ?? 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
      </view>

      <!-- 菜单 -->
      <view class="menu love-card">
        <view class="menu-item" @tap="goMyDiary">
          <text>我的日记</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goMyPost">
          <text>我的动态</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goCollect">
          <text>我的收藏</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goVip">
          <text>会员中心</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goChat">
          <text>消息与私聊</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goNotification">
          <text>消息中心</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goSettings">
          <text>设置</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getUserHome } from '@/api/user';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
import type { UserHomeData } from '@/types/user';

const { checkLogin } = useAuthRedirect();
const loading = ref(false);
const error = ref('');
const home = ref<UserHomeData | null>(null);

const loveStatusText = computed(() => {
  const s = home.value?.user.loveStatus;
  if (s === 1) return '恋爱中';
  if (s === 2) return '已婚';
  return '单身';
});

onShow(() => {
  if (!checkLogin()) return;
  loadHome();
});

async function loadHome() {
  loading.value = true;
  error.value = '';
  try {
    home.value = await getUserHome();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function goProfile() {
  uni.navigateTo({ url: '/pages/user/profile' });
}
function goBind() {
  uni.navigateTo({ url: '/pages/couple/bind' });
}
function goCoupleSpace() {
  uni.navigateTo({ url: '/pages/couple/space' });
}
function goMyDiary() {
  uni.navigateTo({ url: '/pages/user/my-diary' });
}
function goMyPost() {
  uni.navigateTo({ url: '/pages/user/my-post' });
}
function goCollect() {
  uni.navigateTo({ url: '/pages/user/collect' });
}
function goVip() {
  uni.navigateTo({ url: '/pages/vip/index' });
}
function goFollowing() {
  uni.navigateTo({ url: '/pages/user/following' });
}
function goFollowers() {
  uni.navigateTo({ url: '/pages/user/followers' });
}
function goChat() {
  uni.navigateTo({ url: '/pages/chat/index' });
}
function goNotification() {
  uni.navigateTo({ url: '/pages/notification/index' });
}
function goSettings() {
  uni.navigateTo({ url: '/pages/settings/index' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.me-page {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
  background: $love-bg;
}
.state {
  text-align: center;
  padding: 80rpx;
  color: $love-text-muted;
}
.user-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  margin-left: 24rpx;
}
.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: $love-text;
  display: block;
}
.status {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
}
.arrow {
  color: $love-text-muted;
  font-size: 36rpx;
}
.couple-card {
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  color: #fff;
}
.couple-days {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
}
.couple-partner {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}
.invite-card {
  text-align: center;
}
.invite-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $love-text;
}
.invite-desc {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.invite-btn {
  margin-top: 24rpx;
}
.stats-row {
  display: flex;
  background: #fff;
  border-radius: 24rpx;
  margin: 24rpx 0;
  padding: 24rpx 0;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-num {
  font-size: 36rpx;
  font-weight: 600;
  color: $love-primary;
  display: block;
}
.stat-label {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 4rpx;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $love-border;
  font-size: 30rpx;
  color: $love-text;
}
.menu-item:last-child {
  border-bottom: none;
}
</style>
