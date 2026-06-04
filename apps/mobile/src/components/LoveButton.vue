<template>
  <view class="love-button" @tap="$emit('tap')">
    <slot />
  </view>
</template>

<script setup lang="ts">
defineEmits<{ tap: [] }>();
</script>
