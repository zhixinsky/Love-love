<template>
  <view class="page">
    <text class="sec">公开展示</text>
    <view class="row love-card">
      <view class="row-text">
        <text class="label">所在城市</text>
        <text class="hint">用于广场「附近」与主页展示</text>
      </view>
      <input v-model="city" class="inp" placeholder="如：上海" />
    </view>
    <view class="card love-card">
      <text class="label">个人简介</text>
      <textarea
        v-model="bio"
        class="area"
        placeholder="一句话介绍自己，会展示在用户主页"
        maxlength="120"
      />
      <text class="count">{{ bio.length }}/120</text>
    </view>

    <text class="sec">可见与推荐</text>
    <view class="row love-card">
      <view class="row-text">
        <text class="label">在「附近的人」展示我</text>
        <text class="hint">关闭后他人无法在附近列表看到你</text>
      </view>
      <switch
        :checked="showNearby"
        color="#ff6b9d"
        @change="onShowNearby"
      />
    </view>
    <view class="row love-card">
      <view class="row-text">
        <text class="label">允许陌生人私信</text>
        <text class="hint">关闭后仅互相关注的用户可给你发私信</text>
      </view>
      <switch :checked="allowDm" color="#ff6b9d" @change="onAllowDm" />
    </view>

    <text class="sec">安全与社交</text>
    <view class="link-row love-card" @tap="goBlock">
      <text>黑名单管理</text>
      <text class="arrow">›</text>
    </view>

    <view class="love-btn love-btn-primary" @tap="save">
      {{ saving ? '保存中' : '保存设置' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getPrivacy, getProfile, updatePrivacy, updateProfile } from '@/api/user';
import { readSwitchChecked } from '@/utils/uni-event';

const city = ref('');
const bio = ref('');
const showNearby = ref(true);
const allowDm = ref(true);
const saving = ref(false);

onMounted(async () => {
  const [p, priv] = await Promise.all([getProfile(), getPrivacy()]);
  city.value = p.city || '';
  bio.value = p.bio || '';
  showNearby.value = priv.showNearby !== 0;
  allowDm.value = priv.allowDm !== 0;
});

function onShowNearby(e: unknown) {
  showNearby.value = readSwitchChecked(e);
}

function onAllowDm(e: unknown) {
  allowDm.value = readSwitchChecked(e);
}

function goBlock() {
  uni.navigateTo({ url: '/pages/settings/blocklist' });
}

async function save() {
  saving.value = true;
  try {
    await Promise.all([
      updateProfile({ city: city.value, bio: bio.value }),
      updatePrivacy({
        showNearby: showNearby.value ? 1 : 0,
        allowDm: allowDm.value ? 1 : 0,
      }),
    ]);
    uni.showToast({ title: '已保存', icon: 'success' });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '保存失败',
      icon: 'none',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
}
.sec {
  font-size: 26rpx;
  color: $love-text-muted;
  margin: 16rpx 0 12rpx;
  display: block;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 16rpx;
}
.row-text {
  flex: 1;
  margin-right: 16rpx;
}
.label {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.hint {
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 6rpx;
  display: block;
}
.inp {
  width: 200rpx;
  text-align: right;
  font-size: 28rpx;
}
.card {
  padding: 28rpx;
  margin-bottom: 16rpx;
}
.area {
  width: 100%;
  min-height: 160rpx;
  margin-top: 16rpx;
  font-size: 28rpx;
}
.count {
  text-align: right;
  font-size: 22rpx;
  color: $love-text-muted;
  margin-top: 8rpx;
  display: block;
}
.link-row {
  display: flex;
  justify-content: space-between;
  padding: 28rpx;
  margin-bottom: 32rpx;
  font-size: 30rpx;
}
.arrow {
  color: $love-text-muted;
}
.love-btn {
  margin-top: 16rpx;
}
</style>
