<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

onLaunch(() => {
  const userStore = useUserStore();
  userStore.hydrateFromStorage();
});
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: $love-bg;
  color: $love-text;
  font-size: 28rpx;
}
</style>
