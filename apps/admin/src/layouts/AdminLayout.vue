<template>
  <el-container class="admin-layout">
    <el-aside width="220px">
      <div class="logo">恋恋后台</div>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/dashboard">数据看板</el-menu-item>
        <el-menu-item index="/user">用户管理</el-menu-item>
        <el-menu-item index="/audit">内容审核</el-menu-item>
        <el-menu-item index="/report">举报中心</el-menu-item>
        <el-menu-item index="/ai-stats">AI统计</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>{{ pageTitle }}</el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageTitle = computed(() => (route.meta.title as string) || '后台管理');
</script>

<style scoped>
.admin-layout { min-height: 100vh; }
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-weight: 600;
  color: #ff6b9d;
}
.el-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  line-height: 60px;
}
</style>
