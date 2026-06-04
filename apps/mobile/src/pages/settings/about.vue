<template>
  <view class="page">
    <view class="head">
      <text class="logo">💕</text>
      <text class="name">恋恋</text>
      <text class="ver">版本 1.0.0 (Build 100)</text>
    </view>

    <view class="block love-card">
      <text class="h">产品介绍</text>
      <text class="p">恋恋是面向情侣与单身用户的恋爱日记与 AI 情感陪伴产品。记录心情、分享动态、绑定情侣空间，并由 AI「恋恋」提供周报、分析与陪伴。</text>
    </view>

    <view class="links love-card">
      <view class="link-row" @tap="goLegal('terms')">
        <text>用户协议</text>
        <text class="arrow">›</text>
      </view>
      <view class="link-row" @tap="goLegal('privacy')">
        <text>隐私政策</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="block love-card">
      <text class="h">联系我们</text>
      <text class="p">客服邮箱：admin@dokor.cn</text>
      <text class="p">工作时间：工作日 10:00–18:00</text>
    </view>

    <text class="copy">© 2026 恋恋 · 保留所有权利</text>
  </view>
</template>

<script setup lang="ts">
function goLegal(type: string) {
  uni.navigateTo({ url: `/pages/settings/legal?type=${type}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 40rpx 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.head {
  text-align: center;
  margin-bottom: 40rpx;
}
.logo {
  font-size: 80rpx;
  display: block;
}
.name {
  font-size: 48rpx;
  font-weight: 700;
  color: $love-primary;
  display: block;
  margin-top: 12rpx;
}
.ver {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.block {
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.h {
  font-weight: 600;
  font-size: 30rpx;
  display: block;
  margin-bottom: 12rpx;
}
.p {
  font-size: 26rpx;
  line-height: 1.7;
  color: $love-text-muted;
  display: block;
  margin-top: 8rpx;
}
.links {
  padding: 8rpx 28rpx;
  margin-bottom: 20rpx;
}
.link-row {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $love-border;
  font-size: 30rpx;
}
.link-row:last-child {
  border-bottom: none;
}
.arrow {
  color: $love-text-muted;
}
.copy {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #ccc;
  margin-top: 48rpx;
}
</style>
