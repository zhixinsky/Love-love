<template>
  <view class="empty-state">
    <text>{{ text || '暂无数据' }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>();
</script>
