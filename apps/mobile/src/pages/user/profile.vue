<template>
  <view class="profile-page">
    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-else class="form">
      <view class="avatar-row" @tap="onChooseAvatar">
        <UserAvatar :src="form.avatar" />
        <text class="avatar-tip">点击更换头像</text>
      </view>

      <view class="field">
        <text class="label">昵称</text>
        <input v-model="form.nickname" class="love-input" placeholder="昵称" />
      </view>
      <view class="field">
        <text class="label">性别</text>
        <picker :range="genderLabels" :value="genderIndex" @change="onGenderChange">
          <view class="love-input picker-val">{{ genderLabels[genderIndex] }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">生日</text>
        <picker mode="date" :value="form.birthday || '2000-01-01'" @change="onBirthdayChange">
          <view class="love-input picker-val">{{ form.birthday || '请选择' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">城市</text>
        <input v-model="form.city" class="love-input" placeholder="所在城市" />
      </view>
      <view class="field">
        <text class="label">简介</text>
        <textarea
          v-model="form.bio"
          class="love-input bio-input"
          placeholder="写一句介绍自己吧"
          maxlength="200"
        />
      </view>

      <view class="love-btn love-btn-primary" @tap="onSave">
        {{ saving ? '保存中...' : '保存资料' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getProfile, updateProfile } from '@/api/user';
import UserAvatar from '@/components/UserAvatar.vue';
import { useUserStore } from '@/store/user';
import type { UserProfile } from '@/store/user';

const userStore = useUserStore();
const loading = ref(true);
const saving = ref(false);
const genderLabels = ['未知', '男', '女'];
const genderIndex = ref(0);

const form = reactive({
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: '',
  city: '',
  bio: '',
});

onMounted(loadProfile);

async function loadProfile() {
  loading.value = true;
  try {
    const data = await getProfile();
    Object.assign(form, {
      nickname: data.nickname || '',
      avatar: data.avatar || '',
      gender: data.gender ?? 0,
      birthday: data.birthday || '',
      city: data.city || '',
      bio: data.bio || '',
    });
    genderIndex.value = form.gender;
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '加载失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

function onGenderChange(e: { detail: { value: string } }) {
  genderIndex.value = Number(e.detail.value);
  form.gender = genderIndex.value;
}

function onBirthdayChange(e: { detail: { value: string } }) {
  form.birthday = e.detail.value;
}

async function onChooseAvatar() {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        uni.showLoading({ title: '上传中' });
        const { uploadImageFile } = await import('@/utils/upload-file');
        form.avatar = await uploadImageFile(res.tempFilePaths[0]);
      } catch (e: unknown) {
        uni.showToast({
          title: e instanceof Error ? e.message : '上传失败',
          icon: 'none',
        });
      } finally {
        uni.hideLoading();
      }
    },
  });
}

async function onSave() {
  if (!form.nickname.trim()) {
    uni.showToast({ title: '请填写昵称', icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    await updateProfile({ ...form });
    const profile: UserProfile = {
      id: userStore.profile?.id || 0,
      nickname: form.nickname,
      avatar: form.avatar,
      gender: form.gender,
      birthday: form.birthday,
      city: form.city,
      bio: form.bio,
      loveStatus: userStore.profile?.loveStatus,
    };
    if (userStore.profile) {
      userStore.setSession(userStore.token, profile);
    }
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
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

.profile-page {
  min-height: 100vh;
  padding: 32rpx;
  background: $love-bg;
}
.loading-tip {
  text-align: center;
  color: $love-text-muted;
  padding: 80rpx;
}
.avatar-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}
.avatar-tip {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 16rpx;
}
.field {
  margin-bottom: 8rpx;
}
.label {
  font-size: 26rpx;
  color: $love-text-muted;
  margin-bottom: 8rpx;
  display: block;
}
.picker-val {
  line-height: 48rpx;
}
.bio-input {
  min-height: 160rpx;
}
</style>
