<template>
  <view class="login-page">
    <view class="hero">
      <text class="hero-emoji">💕</text>
      <text class="hero-title">恋恋</text>
      <text class="hero-sub">记录心动，AI 陪你成长</text>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="love-btn love-btn-primary wx-btn" @tap="onWechatLogin">
      {{ wxLoading ? '登录中...' : '微信一键登录' }}
    </view>
    <view class="divider"><text>或</text></view>
    <!-- #endif -->

    <view class="form-card love-card">
      <text class="form-title">手机号登录 / 注册</text>
      <input
        v-model="mobile"
        class="love-input"
        type="number"
        maxlength="11"
        placeholder="11 位手机号"
      />
      <view class="code-row">
        <input
          v-model="code"
          class="love-input code-input"
          type="number"
          maxlength="6"
          placeholder="6 位验证码"
        />
        <view class="code-btn" :class="{ disabled: countdown > 0 }" @tap="onSendCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </view>
      </view>
      <view class="love-btn love-btn-primary" @tap="onSubmit">
        {{ loading ? '提交中...' : '登录 / 注册' }}
      </view>
    </view>

    <view class="agreement" @tap="agreed = !agreed">
      <text class="checkbox">{{ agreed ? '☑' : '☐' }}</text>
      <text class="agreement-text">
        我已阅读并同意
        <text class="link" @tap.stop="openLegal('terms')">《用户协议》</text>
        与
        <text class="link" @tap.stop="openLegal('privacy')">《隐私政策》</text>
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { loginByMobile, loginByWechat, sendSmsCode } from '@/api/auth';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const mobile = ref('');
const code = ref('');
const agreed = ref(false);
const loading = ref(false);
const wxLoading = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function validateMobile() {
  if (!/^1\d{10}$/.test(mobile.value)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return false;
  }
  return true;
}

function afterLogin(res: { token: string; user: unknown; isNewUser?: boolean }) {
  userStore.setSession(res.token, res.user as Parameters<typeof userStore.setSession>[1]);
  if (res.isNewUser) {
    uni.showToast({ title: '欢迎加入恋恋', icon: 'success' });
    setTimeout(() => uni.navigateTo({ url: '/pages/user/profile' }), 400);
  } else {
    uni.switchTab({ url: '/pages/post/index' });
  }
}

async function onWechatLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意协议', icon: 'none' });
    return;
  }
  wxLoading.value = true;
  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject });
    });
    const res = await loginByWechat(loginRes.code);
    afterLogin(res);
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '微信登录失败',
      icon: 'none',
    });
  } finally {
    wxLoading.value = false;
  }
}

async function onSendCode() {
  if (countdown.value > 0) return;
  if (!validateMobile()) return;
  try {
    const res = await sendSmsCode(mobile.value);
    uni.showToast({ title: res.message || '验证码已发送', icon: 'none' });
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } catch (e: unknown) {
    uni.showToast({ title: e instanceof Error ? e.message : '发送失败', icon: 'none' });
  }
}

async function onSubmit() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' });
    return;
  }
  if (!validateMobile()) return;
  if (!/^\d{6}$/.test(code.value)) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    afterLogin(await loginByMobile(mobile.value, code.value));
  } catch (e: unknown) {
    uni.showToast({ title: e instanceof Error ? e.message : '登录失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function openLegal(type: string) {
  uni.navigateTo({ url: `/pages/settings/legal?type=${type}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.login-page {
  min-height: 100vh;
  padding: 60rpx 40rpx 40rpx;
  background: linear-gradient(180deg, #fff5f8, $love-bg 40%);
}
.hero {
  text-align: center;
  margin-bottom: 48rpx;
}
.hero-emoji {
  font-size: 100rpx;
}
.hero-title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: $love-primary;
  margin-top: 16rpx;
}
.hero-sub {
  display: block;
  font-size: 28rpx;
  color: $love-text-muted;
  margin-top: 12rpx;
}
.wx-btn {
  margin-bottom: 0;
}
.divider {
  text-align: center;
  margin: 28rpx 0;
  color: $love-text-muted;
  font-size: 24rpx;
}
.form-card {
  padding: 36rpx 32rpx;
}
.form-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}
.code-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
  margin-top: 8rpx;
}
.code-input {
  flex: 1;
  margin-bottom: 0;
}
.code-btn {
  flex-shrink: 0;
  padding: 0 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
  color: $love-primary;
  background: $love-primary-light;
  border-radius: 16rpx;
}
.code-btn.disabled {
  color: $love-text-muted;
}
.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 40rpx;
  padding: 0 16rpx;
}
.checkbox {
  color: $love-primary;
  margin-right: 12rpx;
}
.agreement-text {
  font-size: 24rpx;
  color: $love-text-muted;
  line-height: 1.6;
}
.link {
  color: $love-primary;
}
</style>
