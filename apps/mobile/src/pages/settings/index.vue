<template>
  <view class="settings-page">
    <view class="profile-tip love-card" @tap="goProfile">
      <text>账号与资料</text>
      <text class="arrow">编辑资料 ›</text>
    </view>

    <text class="sec">隐私与安全</text>
    <view class="menu love-card">
      <view class="menu-item" @tap="goPrivacy">
        <text>隐私设置</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goBlocklist">
        <text>黑名单</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goChat">
        <text>消息与聊天</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <text class="sec">关于</text>
    <view class="menu love-card">
      <view class="menu-item" @tap="goAbout">
        <text>关于我们</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goLegal('terms')">
        <text>用户协议</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goLegal('privacy')">
        <text>隐私政策</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="love-btn logout-btn" @tap="onLogout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

function goProfile() {
  uni.navigateTo({ url: '/pages/user/profile' });
}
function goPrivacy() {
  uni.navigateTo({ url: '/pages/settings/privacy' });
}
function goBlocklist() {
  uni.navigateTo({ url: '/pages/settings/blocklist' });
}
function goChat() {
  uni.navigateTo({ url: '/pages/chat/index' });
}
function goAbout() {
  uni.navigateTo({ url: '/pages/settings/about' });
}
function goLegal(type: string) {
  uni.navigateTo({ url: `/pages/settings/legal?type=${type}` });
}
function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号？',
    success: (res) => {
      if (res.confirm) userStore.logout();
    },
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.settings-page {
  min-height: 100vh;
  padding: 24rpx;
  background: $love-bg;
}
.profile-tip {
  display: flex;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
}
.sec {
  font-size: 26rpx;
  color: $love-text-muted;
  margin: 16rpx 0 12rpx 8rpx;
  display: block;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $love-border;
  font-size: 30rpx;
}
.menu-item:last-child {
  border-bottom: none;
}
.arrow {
  color: $love-text-muted;
}
.logout-btn {
  margin-top: 48rpx;
  background: #fff;
  color: #ff4d4f;
  border: 2rpx solid #ffccc7;
  text-align: center;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
