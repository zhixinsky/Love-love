<template>
  <el-card>
    <template #header>{{ title }}</template>
    <p>页面骨架 — 待对接接口与业务逻辑</p>
    <el-tag type="info">{{ pageId }}</el-tag>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{ title: string; pageId: string }>();
</script>
