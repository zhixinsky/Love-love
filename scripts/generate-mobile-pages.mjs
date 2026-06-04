import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_PAGES, TAB_PAGES, PUBLISH_TAB_PAGE } from './page-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.join(__dirname, '..', 'apps', 'mobile', 'src');

const allPages = [...APP_PAGES];
if (!allPages.find((p) => p.path === PUBLISH_TAB_PAGE.path)) {
  const idx = allPages.findIndex((p) => p.id === 'P014');
  allPages.splice(idx >= 0 ? idx : 0, 0, PUBLISH_TAB_PAGE);
}

const vueTemplate = (page) => `<template>
  <view class="page page-${page.id.toLowerCase()}">
    <view class="page-header">
      <text class="page-id">${page.id}</text>
      <text class="page-title">${page.title}</text>
    </view>
    <view class="page-path">{{ routePath }}</view>
    <view class="page-placeholder">页面骨架 — 待实现业务</view>
  </view>
</template>

<script setup lang="ts">
const routePath = '${page.path}';
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: $love-bg;
}
.page-id {
  font-size: 24rpx;
  color: $love-primary;
}
.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: $love-text;
  margin-top: 8rpx;
}
.page-path {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-top: 16rpx;
}
.page-placeholder {
  margin-top: 48rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  color: $love-text-muted;
  font-size: 28rpx;
}
</style>
`;

function buildPagesJson() {
  const mainOrder = [
    'pages/splash/index',
    'pages/login/index',
    ...TAB_PAGES.map((t) => t.path),
  ];
  const pages = [];
  const seen = new Set();
  for (const pathKey of mainOrder) {
    const page = allPages.find((p) => p.path === pathKey);
    if (page && !seen.has(pathKey)) {
      seen.add(pathKey);
      pages.push({
        path: page.path,
        style: {
          navigationBarTitleText: page.title,
          navigationStyle: pathKey === 'pages/splash/index' ? 'custom' : 'default',
        },
      });
    }
  }

  const subRoots = [
    'post',
    'diary',
    'ai',
    'meet',
    'chat',
    'common',
    'couple',
    'notification',
    'user',
    'vip',
    'settings',
  ];
  const subPackages = subRoots
    .map((root) => {
      const prefix = `pages/${root}/`;
      const pkgPages = allPages.filter((p) => p.path.startsWith(prefix));
      return {
        root: `pages/${root}`,
        pages: pkgPages.map((p) => ({
          path: p.path.replace(prefix, ''),
          style: { navigationBarTitleText: p.title },
        })),
      };
    })
    .filter((s) => s.pages.length > 0);

  return {
    easycom: {
      autoscan: true,
      custom: { '^Love(.*)': '@/components/Love$1.vue' },
    },
    pages,
    subPackages,
    globalStyle: {
      navigationBarTextStyle: 'black',
      navigationBarTitleText: '恋恋',
      navigationBarBackgroundColor: '#FFF5F8',
      backgroundColor: '#FFF5F8',
    },
    tabBar: {
      color: '#999999',
      selectedColor: '#FF6B9D',
      backgroundColor: '#FFFFFF',
      borderStyle: 'black',
      list: TAB_PAGES.map((t, i) => ({
        pagePath: t.path,
        text: t.text,
        iconPath: `static/tab/${['square', 'meet', 'publish', 'ai', 'me'][i]}.png`,
        selectedIconPath: `static/tab/${['square', 'meet', 'publish', 'ai', 'me'][i]}-active.png`,
      })),
    },
  };
}

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const tabDir = path.join(mobileRoot, 'static', 'tab');
fs.mkdirSync(tabDir, { recursive: true });
for (const name of ['square', 'meet', 'publish', 'ai', 'me']) {
  fs.writeFileSync(path.join(tabDir, `${name}.png`), png1x1);
  fs.writeFileSync(path.join(tabDir, `${name}-active.png`), png1x1);
}

for (const page of allPages) {
  const dir = path.join(mobileRoot, path.dirname(page.path));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(mobileRoot, `${page.path}.vue`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, vueTemplate(page), 'utf8');
  }
}

fs.mkdirSync(path.join(mobileRoot, 'constants'), { recursive: true });
fs.writeFileSync(path.join(mobileRoot, 'pages.json'), JSON.stringify(buildPagesJson(), null, 2), 'utf8');

const registry = allPages.map((p) => ({
  id: p.id,
  path: '/' + p.path,
  title: p.title,
  pkg: p.pkg,
}));
fs.writeFileSync(
  path.join(mobileRoot, 'constants', 'page-registry.ts'),
  `/** 自动生成 — 对齐 md/页面清单.md */\nexport interface PageMeta {\n  id: string;\n  path: string;\n  title: string;\n  pkg: string;\n}\n\nexport const PAGE_REGISTRY: PageMeta[] = ${JSON.stringify(registry, null, 2)};\n`,
  'utf8',
);

console.log(`Generated ${allPages.length} pages`);
