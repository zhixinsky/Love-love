<template>
  <div class="login-page">
    <div class="brand">
      <span class="logo">💕</span>
      <h1>恋恋运营后台</h1>
      <p>P052 管理员登录</p>
    </div>
    <el-card class="login-card" shadow="hover">
      <el-form @submit.prevent="onSubmit" label-position="top">
        <el-form-item label="管理员账号">
          <el-input v-model="username" placeholder="admin" size="large" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            show-password
            placeholder="请输入密码"
            size="large"
          />
        </el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          style="width: 100%"
          :loading="loading"
        >
          登录
        </el-button>
      </el-form>
      <p class="hint">请使用生产环境配置的管理员账号，勿在公网暴露弱密码。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { adminLogin } from '@/api/admin';

const router = useRouter();
const username = ref('admin');
const password = ref('');
const loading = ref(false);

async function onSubmit() {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入账号和密码');
    return;
  }
  loading.value = true;
  try {
    const res = (await adminLogin(username.value, password.value)) as {
      token?: string;
    };
    if (!res?.token) throw new Error('未返回 token');
    localStorage.setItem('admin_token', res.token);
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #fff5f8, #ffe8f0);
  padding: 24px;
}
.brand {
  text-align: center;
  margin-bottom: 32px;
}
.logo {
  font-size: 56px;
}
.brand h1 {
  margin: 12px 0 4px;
  color: #ff6b9d;
}
.brand p {
  color: #999;
  font-size: 14px;
}
.login-card {
  width: 100%;
  max-width: 420px;
}
.hint {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>
