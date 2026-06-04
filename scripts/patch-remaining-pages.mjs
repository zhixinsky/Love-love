/** 为剩余骨架页注入统一功能页（列表/表单/导航） */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_PAGES, PUBLISH_TAB_PAGE } from './page-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'apps', 'mobile', 'src', 'pages');

const done = new Set([
  'splash/index', 'login/index', 'post/index', 'post/publish', 'post/detail',
  'me/index', 'user/profile', 'diary/index', 'diary/edit', 'couple/bind',
  'couple/invite', 'meet/index', 'publish/index', 'ai/index', 'ai/chat',
  'bottle/index', 'chat/index', 'notification/index', 'settings/index',
]);

const navMap = {
  'diary/detail': { api: 'diary', type: 'detail' },
  'couple/space': { api: 'couple/info', type: 'info' },
  'couple/timeline': { title: '恋爱时间轴', stub: true },
  'couple/album': { title: '共同相册', stub: true },
  'wish/index': { api: 'wish/list', type: 'list' },
  'wish/edit': { api: 'wish/create', type: 'form' },
  'anniversary/index': { api: 'anniversary/list', type: 'list' },
  'anniversary/edit': { api: 'anniversary/create', type: 'form' },
  'bottle/throw': { api: 'bottle', type: 'throw' },
  'bottle/detail': { api: 'bottle', type: 'detail' },
  'chat/detail': { api: 'chat', type: 'chat' },
  'ai/memory': { api: 'ai/memory', type: 'list' },
  'ai/report': { api: 'ai.report', type: 'report' },
  'ai/analysis': { title: 'AI恋爱分析', stub: true },
  'meet/nearby': { title: '附近的人', stub: true },
  'user/home': { title: '用户主页', stub: true },
  'common/image-preview': { title: '图片预览', stub: true },
};

function tpl(page, rel) {
  const meta = navMap[rel] || { title: page.title, stub: true };
  return `<template>
  <view class="func-page">
    <text class="pid">${page.id}</text>
    <text class="ptitle">${page.title}</text>
    <view v-if="loading" class="tip">加载中...</view>
    <view v-else-if="data" class="data love-card"><text>{{ JSON.stringify(data) }}</text></view>
    <text v-else class="tip">${meta.stub ? '功能入口已就绪，详见联调文档' : '暂无数据'}</text>
    <view v-if="actions.length" class="actions">
      <view v-for="a in actions" :key="a.url" class="love-btn love-btn-outline" @tap="go(a.url)">{{ a.label }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthRedirect } from '@/composables/useAuthRedirect';
${meta.api === 'couple/info' ? "import { getCoupleInfo } from '@/api/couple';" : ''}
${meta.api === 'wish/list' ? "import { getWishList } from '@/api/wish';" : ''}
${meta.api === 'anniversary/list' ? "import { getAnniversaryList } from '@/api/anniversary';" : ''}
${meta.api === 'ai.memory' ? "import { getAiMemoryList } from '@/api/ai';" : ''}

const { checkLogin } = useAuthRedirect();
const loading = ref(false);
const data = ref<unknown>(null);
const actions = ${JSON.stringify(getActions(rel))};

onMounted(async () => {
  if (!checkLogin()) return;
  loading.value = true;
  try {
    ${getLoadCode(rel)}
  } catch { /* ignore */ } finally { loading.value = false; }
});

function go(url: string) { uni.navigateTo({ url }); }
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.func-page { padding: 24rpx; min-height: 100vh; background: $love-bg; }
.pid { color: $love-primary; font-size: 24rpx; }
.ptitle { display: block; font-size: 36rpx; font-weight: 600; margin: 12rpx 0 24rpx; }
.tip { color: $love-text-muted; font-size: 26rpx; }
.data { font-size: 22rpx; word-break: break-all; }
.actions { margin-top: 32rpx; display: flex; flex-direction: column; gap: 16rpx; }
</style>
`;
}

function getActions(rel) {
  const m = {
    'couple/space': [
      { label: '愿望清单', url: '/pages/wish/index' },
      { label: '纪念日', url: '/pages/anniversary/index' },
    ],
    'ai/index': [],
  };
  return m[rel] || [];
}

function getLoadCode(rel) {
  if (rel === 'couple/space') return 'data.value = await getCoupleInfo();';
  if (rel === 'wish/index') return 'data.value = await getWishList();';
  if (rel === 'anniversary/index') return 'data.value = await getAnniversaryList();';
  if (rel === 'ai/memory') return 'data.value = await getAiMemoryList();';
  return 'data.value = null;';
}

const all = [...APP_PAGES, PUBLISH_TAB_PAGE];
let n = 0;
for (const p of all) {
  const rel = p.path.replace('pages/', '');
  if (done.has(rel)) continue;
  const file = path.join(root, rel + '.vue');
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('页面骨架')) {
    fs.writeFileSync(file, tpl(p, rel), 'utf8');
    n++;
  }
}
console.log('Patched', n, 'pages');
