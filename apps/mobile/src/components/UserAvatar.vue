<template>
  <image
    class="user-avatar"
    :src="displaySrc"
    mode="aspectFill"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ src?: string }>();

const displaySrc = computed(
  () => props.src || 'https://via.placeholder.com/120/FFE0EB/FF6B9D?text=恋',
);
</script>

<style scoped>
.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #ffe0eb;
}
</style>
