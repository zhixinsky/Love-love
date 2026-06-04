/**
 * 将 func-page 占位页替换为生产级 UI（对照 md/页面清单.md）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'apps', 'mobile', 'src', 'pages');

const pages = {
  'diary/detail.vue': `<template>
  <view class="page" v-if="diary">
    <text class="title">{{ diary.title || '无标题' }}</text>
    <text class="meta">{{ diary.mood }} · {{ diary.weather }} · {{ visLabel }}</text>
    <text class="content">{{ diary.content }}</text>
    <view class="imgs" v-if="media.length">
      <image v-for="(m,i) in media" :key="i" :src="m.url" mode="aspectFill" class="img" @tap="preview(i)" />
    </view>
    <view class="btns">
      <view class="love-btn love-btn-outline" @tap="edit">编辑</view>
      <view class="love-btn love-btn-outline" @tap="goAi">AI 分析</view>
      <view class="love-btn" @tap="remove">删除</view>
    </view>
  </view>
  <EmptyState v-else-if="!loading" text="日记不存在" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { deleteDiary, getDiaryDetail } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';
const id = ref('');
const loading = ref(true);
const diary = ref<Record<string, unknown> | null>(null);
const media = ref<{ url: string }[]>([]);
const visLabel = ref('');
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
if (cur?.options?.id) { id.value = cur.options.id; load(); }
async function load() {
  loading.value = true;
  try {
    const d = await getDiaryDetail(id.value);
    diary.value = d;
    media.value = (d.mediaList as { url: string }[]) || [];
    const v = Number(d.visibility);
    visLabel.value = v === 1 ? '仅自己' : v === 2 ? '情侣可见' : '公开';
  } catch { diary.value = null; } finally { loading.value = false; }
}
function edit() { uni.navigateTo({ url: '/pages/diary/edit?id=' + id.value }); }
function goAi() { uni.navigateTo({ url: '/pages/ai/analysis' }); }
function preview(i: number) {
  uni.previewImage({ urls: media.value.map(m => m.url), current: media.value[i].url });
}
async function remove() {
  uni.showModal({
    title: '删除日记',
    content: '确定删除吗？',
    success: async (r) => {
      if (!r.confirm) return;
      await deleteDiary(id.value);
      uni.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 400);
    },
  });
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.title{font-size:40rpx;font-weight:700;display:block;margin-bottom:12rpx;}
.meta{color:$love-text-muted;font-size:24rpx;display:block;margin-bottom:24rpx;}
.content{font-size:30rpx;line-height:1.6;display:block;}
.imgs{display:flex;flex-wrap:wrap;gap:12rpx;margin:24rpx 0;}
.img{width:220rpx;height:220rpx;border-radius:12rpx;}
.btns{margin-top:40rpx;display:flex;flex-direction:column;gap:16rpx;}
</style>`,

  'bottle/detail.vue': `<template>
  <view class="page" v-if="bottle">
    <view class="card love-card">
      <text class="content">{{ bottle.content }}</text>
      <text class="meta">{{ bottle.city || '来自远方' }}</text>
    </view>
    <textarea v-model="reply" class="love-input" placeholder="写一句回复..." />
    <view class="love-btn love-btn-primary" @tap="sendReply">回复并开聊</view>
    <view class="love-btn love-btn-outline" @tap="pickAgain">再捞一个</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { pickBottle, replyBottle } from '@/api/bottle';
const bottle = ref<Record<string, unknown> | null>(null);
const reply = ref('');
import { onMounted } from 'vue';
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
onMounted(async () => {
  if (cur?.options?.id) {
    bottle.value = { id: cur.options.id, content: '加载中...' };
  } else {
    bottle.value = (await pickBottle()) as Record<string, unknown>;
  }
});
async function sendReply() {
  if (!reply.value.trim() || !bottle.value) return;
  await replyBottle({ bottleId: bottle.value.id, content: reply.value });
  uni.showToast({ title: '已回复', icon: 'success' });
  uni.navigateTo({ url: '/pages/chat/index' });
}
async function pickAgain() {
  bottle.value = (await pickBottle()) as Record<string, unknown>;
  reply.value = '';
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.content{font-size:32rpx;line-height:1.6;display:block;}
.meta{color:$love-text-muted;font-size:24rpx;margin-top:16rpx;display:block;}
.love-input{min-height:160rpx;margin:24rpx 0;}
</style>`,

  'bottle/throw.vue': `<template>
  <view class="page">
    <textarea v-model="content" class="love-input area" placeholder="写下你想说的话..." />
    <input v-model="city" class="love-input" placeholder="城市（可选）" />
    <view class="love-btn love-btn-primary" @tap="submit">扔进海里</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { throwBottle } from '@/api/bottle';
const content = ref('');
const city = ref('');
async function submit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' }); return;
  }
  await throwBottle({ content: content.value, city: city.value, isAnonymous: 1 });
  uni.showToast({ title: '已扔出', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 500);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.area{min-height:320rpx;margin-bottom:24rpx;}
</style>`,

  'wish/index.vue': `<template>
  <view class="page">
    <view class="love-btn love-btn-primary" @tap="goAdd">+ 添加愿望</view>
    <EmptyState v-if="!list.length && !loading" text="还没有愿望，一起列个清单吧" />
    <view v-for="item in list" :key="item.id" class="item love-card" @tap="toggle(item)">
      <text :class="{ done: item.completed }">{{ item.title }}</text>
      <text class="sub">{{ item.completed ? '已完成' : '点击标记完成' }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { completeWish, getWishList } from '@/api/wish';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(() => load());
async function load() {
  loading.value = true;
  try { const res = await getWishList(); list.value = (res.list as any[]) || []; }
  catch { list.value = []; } finally { loading.value = false; }
}
function goAdd() { uni.navigateTo({ url: '/pages/wish/edit' }); }
async function toggle(item: any) {
  if (item.completed) return;
  await completeWish(item.id);
  item.completed = true;
  uni.showToast({ title: '愿望达成', icon: 'success' });
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:20rpx;padding:24rpx;}
.done{text-decoration:line-through;color:$love-text-muted;}
.sub{display:block;font-size:22rpx;color:$love-text-muted;margin-top:8rpx;}
</style>`,

  'wish/edit.vue': `<template>
  <view class="page">
    <input v-model="title" class="love-input" placeholder="愿望内容" />
    <textarea v-model="desc" class="love-input area" placeholder="详细描述（可选）" />
    <view class="love-btn love-btn-primary" @tap="save">保存</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { createWish } from '@/api/wish';
const title = ref('');
const desc = ref('');
async function save() {
  if (!title.value.trim()) { uni.showToast({ title: '请填写愿望', icon: 'none' }); return; }
  await createWish({ title: title.value, description: desc.value });
  uni.showToast({ title: '已添加', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 400);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.area{min-height:200rpx;margin-top:16rpx;}
</style>`,

  'anniversary/index.vue': `<template>
  <view class="page">
    <view class="love-btn love-btn-primary" @tap="goAdd">+ 添加纪念日</view>
    <EmptyState v-if="!list.length && !loading" text="记录每一个重要日子" />
    <view v-for="item in list" :key="item.id" class="item love-card">
      <text class="name">{{ item.title }}</text>
      <text class="date">{{ item.anniversaryDate }}</text>
      <text class="days">还有 {{ item.daysLeft ?? 0 }} 天</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getAnniversaryList } from '@/api/anniversary';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(() => load());
async function load() {
  loading.value = true;
  try { const res = await getAnniversaryList(); list.value = (res.list as any[]) || []; }
  catch { list.value = []; } finally { loading.value = false; }
}
function goAdd() { uni.navigateTo({ url: '/pages/anniversary/edit' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:20rpx;padding:24rpx;}
.name{font-size:32rpx;font-weight:600;display:block;}
.date,.days{font-size:24rpx;color:$love-text-muted;display:block;margin-top:8rpx;}
</style>`,

  'anniversary/edit.vue': `<template>
  <view class="page">
    <input v-model="title" class="love-input" placeholder="纪念日名称" />
    <picker mode="date" @change="onDate"><view class="love-input">日期：{{ date || '请选择' }}</view></picker>
    <view class="love-btn love-btn-primary" @tap="save">保存</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { createAnniversary } from '@/api/anniversary';
const title = ref('');
const date = ref('');
function onDate(e: { detail: { value: string } }) { date.value = e.detail.value; }
async function save() {
  if (!title.value || !date.value) { uni.showToast({ title: '请填写完整', icon: 'none' }); return; }
  await createAnniversary({ title: title.value, anniversaryDate: date.value });
  uni.showToast({ title: '已添加', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 400);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
</style>`,

  'ai/memory.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length && !loading" text="恋恋还没有记住特别的事" />
    <view v-for="item in list" :key="item.id" class="item love-card">
      <text class="content">{{ item.content }}</text>
      <text class="meta">重要度 {{ item.importance }}</text>
      <text class="del" @tap="remove(item.id)">删除</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { deleteAiMemory, getAiMemoryList } from '@/api/ai';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(() => load());
async function load() {
  loading.value = true;
  try { const res = await getAiMemoryList(); list.value = (res.list as any[]) || []; }
  catch { list.value = []; } finally { loading.value = false; }
}
async function remove(id: string) {
  await deleteAiMemory(id);
  list.value = list.value.filter((x) => x.id !== id);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:16rpx;padding:24rpx;position:relative;}
.content{font-size:28rpx;display:block;}
.meta{font-size:22rpx;color:$love-text-muted;margin-top:8rpx;display:block;}
.del{position:absolute;right:24rpx;top:24rpx;color:#e74c3c;font-size:24rpx;}
</style>`,

  'ai/analysis.vue': `<template>
  <view class="page">
    <view class="love-btn love-btn-primary" @tap="load">刷新分析</view>
    <view v-if="report" class="card love-card">
      <view class="row" v-for="s in scores" :key="s.label"><text>{{ s.label }}</text><text class="num">{{ s.value }}</text></view>
      <text class="sum">{{ report.summary }}</text>
      <text class="sug">建议：{{ report.suggestion }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { generateAiReport, getAiReport } from '@/api/ai';
const report = ref<any>(null);
const scores = computed(() => report.value ? [
  { label: '情绪', value: report.value.emotionScore },
  { label: '亲密', value: report.value.intimacyScore },
  { label: '沟通', value: report.value.communicationScore },
  { label: '综合', value: report.value.totalScore },
] : []);
async function load() {
  const { reportId } = await generateAiReport();
  report.value = await getAiReport(reportId);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.row{display:flex;justify-content:space-between;padding:12rpx 0;border-bottom:1rpx solid #f0f0f0;}
.num{color:$love-primary;font-weight:700;}
.sum,.sug{display:block;margin-top:24rpx;font-size:28rpx;line-height:1.5;}
</style>`,
};

// 通知子页模板生成器
function notifPage(type, title) {
  return `<template>
  <view class="page">
    <EmptyState v-if="!list.length && !loading" text="暂无${title}" />
    <view v-for="item in list" :key="item.id" class="item love-card" @tap="read(item)">
      <text class="t">{{ item.title }}</text>
      <text class="c">{{ item.content }}</text>
      <view v-if="!item.isRead" class="dot" />
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getNotificationList, markNotificationRead } from '@/api/notification';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(() => load());
async function load() {
  loading.value = true;
  try {
    const res = await getNotificationList({ page: 1, pageSize: 50, type: ${type} });
    list.value = (res.list as any[]) || [];
  } catch { list.value = []; } finally { loading.value = false; }
}
async function read(item: any) {
  if (!item.isRead) await markNotificationRead([item.id]);
  item.isRead = 1;
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:16rpx;padding:24rpx;position:relative;}
.t{font-weight:600;display:block;}
.c{font-size:26rpx;color:$love-text-muted;margin-top:8rpx;display:block;}
.dot{position:absolute;right:24rpx;top:24rpx;width:16rpx;height:16rpx;background:$love-primary;border-radius:50%;}
</style>`;
}

Object.assign(pages, {
  'notification/like.vue': notifPage(1, '点赞通知'),
  'notification/comment.vue': notifPage(2, '评论通知'),
  'notification/ai.vue': notifPage(3, 'AI提醒'),
  'notification/couple.vue': notifPage(4, '情侣通知'),
  'meet/nearby.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length && !loading" text="附近暂无更多用户" />
    <view v-for="u in list" :key="u.id" class="card love-card" @tap="goUser(u.id)">
      <image :src="u.avatar || '/static/default-avatar.png'" class="av" />
      <view class="info"><text class="name">{{ u.nickname }}</text><text class="sub">{{ u.city }} · {{ u.distance }}</text></view>
      <view class="love-btn love-btn-outline sm" @tap.stop="follow(u)">关注</view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getNearbyUsers, toggleFollow } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
const loading = ref(false);
onShow(() => load());
async function load() {
  loading.value = true;
  try { const res = await getNearbyUsers(); list.value = (res.list as any[]) || []; }
  catch { list.value = []; } finally { loading.value = false; }
}
function goUser(id: string) { uni.navigateTo({ url: '/pages/user/home?id=' + id }); }
async function follow(u: any) {
  await toggleFollow(Number(u.id));
  uni.showToast({ title: '已关注', icon: 'success' });
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.card{display:flex;align-items:center;margin-top:16rpx;padding:20rpx;}
.av{width:96rpx;height:96rpx;border-radius:50%;margin-right:20rpx;}
.info{flex:1;}
.name{font-size:30rpx;font-weight:600;display:block;}
.sub{font-size:24rpx;color:$love-text-muted;}
.sm{padding:8rpx 24rpx;font-size:24rpx;}
</style>`,
  'user/home.vue': `<template>
  <view class="page" v-if="user">
    <image :src="user.avatar || '/static/default-avatar.png'" class="av" />
    <text class="name">{{ user.nickname }}</text>
    <text class="bio">{{ user.bio || '这个人很神秘' }}</text>
    <view class="love-btn love-btn-primary" @tap="follow">{{ user.isFollowed ? '已关注' : '关注' }}</view>
    <view class="love-btn love-btn-outline" @tap="chat">私信</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { getPublicUser, toggleFollow } from '@/api/user';
const user = ref<any>(null);
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { id?: string } };
if (cur?.options?.id) load(cur.options.id);
async function load(id: string) { user.value = await getPublicUser(id); }
async function follow() {
  if (!user.value) return;
  const res = await toggleFollow(Number(user.value.id));
  user.value.isFollowed = res.followed;
}
function chat() { uni.navigateTo({ url: '/pages/chat/index' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:48rpx 24rpx;text-align:center;background:$love-bg;min-height:100vh;}
.av{width:160rpx;height:160rpx;border-radius:50%;margin:0 auto 24rpx;}
.name{font-size:40rpx;font-weight:700;display:block;}
.bio{color:$love-text-muted;margin:16rpx 0 32rpx;display:block;}
.love-btn{margin-top:16rpx;}
</style>`,
  'user/my-diary.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length" text="还没有日记" />
    <view v-for="d in list" :key="d.id" class="item love-card" @tap="go(d.id)">
      <text class="t">{{ d.title || d.content?.slice(0,30) }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
onShow(async () => {
  const res = await getDiaryList({ page: 1, pageSize: 50, tab: 'mine' });
  list.value = (res.list as any[]) || [];
});
function go(id: string) { uni.navigateTo({ url: '/pages/diary/detail?id=' + id }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:16rpx;padding:24rpx;}
</style>`,
  'user/my-post.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length" text="还没有动态" />
    <PostCard v-for="p in list" :key="p.id" :post="p" @tap="go(p.id)" />
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getPostList } from '@/api/post';
import EmptyState from '@/components/EmptyState.vue';
import PostCard from '@/components/PostCard.vue';
const list = ref<any[]>([]);
onShow(async () => {
  const res = await getPostList({ page: 1, pageSize: 50, tab: 'mine' });
  list.value = (res.list as any[]) || [];
});
function go(id: string) { uni.navigateTo({ url: '/pages/post/detail?id=' + id }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
</style>`,
  'user/collect.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length" text="还没有收藏" />
    <view v-for="c in list" :key="c.id" class="item love-card" @tap="open(c)">
      <text>{{ c.title }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getCollectList } from '@/api/collect';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
onShow(async () => {
  const res = await getCollectList({ page: 1, pageSize: 50 });
  list.value = (res.list as any[]) || [];
});
function open(c: any) {
  if (c.targetType === 1) uni.navigateTo({ url: '/pages/post/detail?id=' + c.targetId });
  else uni.navigateTo({ url: '/pages/diary/detail?id=' + c.targetId });
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{margin-top:16rpx;padding:24rpx;}
</style>`,
  'user/following.vue': `<template>
  <view class="page">
    <view v-for="u in list" :key="u.id" class="item love-card" @tap="go(u.id)">
      <image :src="u.avatar" class="av" /><text>{{ u.nickname }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getFollowingList } from '@/api/user';
const list = ref<any[]>([]);
onShow(async () => { const res = await getFollowingList(); list.value = (res.list as any[]) || []; });
function go(id: string) { uni.navigateTo({ url: '/pages/user/home?id=' + id }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{display:flex;align-items:center;margin-top:16rpx;padding:20rpx;}
.av{width:72rpx;height:72rpx;border-radius:50%;margin-right:16rpx;}
</style>`,
  'user/followers.vue': `<template>
  <view class="page">
    <view v-for="u in list" :key="u.id" class="item love-card" @tap="go(u.id)">
      <image :src="u.avatar" class="av" /><text>{{ u.nickname }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getFollowersList } from '@/api/user';
const list = ref<any[]>([]);
onShow(async () => { const res = await getFollowersList(); list.value = (res.list as any[]) || []; });
function go(id: string) { uni.navigateTo({ url: '/pages/user/home?id=' + id }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.item{display:flex;align-items:center;margin-top:16rpx;padding:20rpx;}
.av{width:72rpx;height:72rpx;border-radius:50%;margin-right:16rpx;}
</style>`,
  'settings/privacy.vue': `<template>
  <view class="page">
    <view class="row love-card"><text>日记默认可见</text><picker :range="opts" @change="onPick"><text>{{ opts[vis] }}</text></picker></view>
    <view class="row love-card"><text>允许陌生人私信</text><switch :checked="allowMsg" @change="e => allowMsg = e.detail.value" /></view>
    <view class="love-btn love-btn-primary" @tap="save">保存</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const opts = ['仅自己', '情侣可见', '公开'];
const vis = ref(1);
const allowMsg = ref(true);
function onPick(e: { detail: { value: string } }) { vis.value = Number(e.detail.value); }
function save() { uni.showToast({ title: '已保存', icon: 'success' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.row{display:flex;justify-content:space-between;align-items:center;padding:28rpx;margin-bottom:16rpx;}
</style>`,
  'settings/blocklist.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length" text="黑名单为空" />
    <view v-for="u in list" :key="u.userId" class="row love-card">
      <text>{{ u.nickname }}</text>
      <text class="unlink" @tap="unblock(u.userId)">移除</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getBlockList, unblockUser } from '@/api/user';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<any[]>([]);
onShow(async () => { const res = await getBlockList(); list.value = (res.list as any[]) || []; });
async function unblock(id: string) {
  await unblockUser(id);
  list.value = list.value.filter((x) => x.userId !== id);
}
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.row{display:flex;justify-content:space-between;padding:28rpx;margin-bottom:16rpx;}
.unlink{color:#e74c3c;}
</style>`,
  'settings/about.vue': `<template>
  <view class="page">
    <text class="logo">恋恋</text>
    <text class="ver">版本 1.0.0</text>
    <text class="desc">恋爱日记 + AI 恋人陪伴</text>
    <view class="love-btn love-btn-outline" @tap="open">用户协议与隐私政策</view>
  </view>
</template>
<script setup lang="ts">
function open() { uni.showToast({ title: '协议页面开发中', icon: 'none' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:80rpx 24rpx;text-align:center;background:$love-bg;min-height:100vh;}
.logo{font-size:56rpx;font-weight:700;color:$love-primary;display:block;}
.ver,.desc{display:block;margin-top:16rpx;color:$love-text-muted;}
.love-btn{margin-top:48rpx;}
</style>`,
  'vip/index.vue': `<template>
  <view class="page">
    <view class="hero love-card"><text class="t">恋恋 VIP</text><text class="s">解锁 AI 深度分析、无限记忆、情侣专属皮肤</text></view>
    <view class="love-btn love-btn-primary" @tap="go">开通会员</view>
    <view class="love-btn love-btn-outline" @tap="goCouple">情侣会员</view>
  </view>
</template>
<script setup lang="ts">
function go() { uni.navigateTo({ url: '/pages/vip/purchase' }); }
function goCouple() { uni.navigateTo({ url: '/pages/vip/couple' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.hero{padding:40rpx;margin-bottom:32rpx;}
.t{font-size:40rpx;font-weight:700;display:block;}
.s{font-size:26rpx;color:$love-text-muted;margin-top:12rpx;display:block;}
</style>`,
  'vip/purchase.vue': `<template>
  <view class="page">
    <view v-for="p in plans" :key="p.id" class="plan love-card" :class="{ on: sel===p.id }" @tap="sel=p.id">
      <text class="name">{{ p.name }}</text><text class="price">¥{{ p.price }}</text>
    </view>
    <view class="love-btn love-btn-primary" @tap="buy">立即开通</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const sel = ref('m');
const plans = [
  { id: 'm', name: '月度会员', price: 18 },
  { id: 'y', name: '年度会员', price: 128 },
];
function buy() { uni.showToast({ title: '支付接口即将上线', icon: 'none' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.plan{padding:32rpx;margin-bottom:16rpx;border:2rpx solid transparent;}
.plan.on{border-color:$love-primary;}
.name{font-size:32rpx;font-weight:600;display:block;}
.price{color:$love-primary;font-size:36rpx;margin-top:8rpx;display:block;}
</style>`,
  'vip/couple.vue': `<template>
  <view class="page">
    <text class="tip">情侣会员需双方已绑定，开通后共享 VIP 权益</text>
    <view class="love-btn love-btn-primary" @tap="buy">开通情侣会员 ¥198/年</view>
  </view>
</template>
<script setup lang="ts">
function buy() { uni.showToast({ title: '支付接口即将上线', icon: 'none' }); }
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:48rpx 24rpx;background:$love-bg;min-height:100vh;}
.tip{color:$love-text-muted;font-size:28rpx;line-height:1.5;display:block;margin-bottom:40rpx;}
</style>`,
  'common/image-preview.vue': `<template>
  <view class="page"><image :src="url" mode="widthFix" class="img" @longpress="save" /></view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const url = ref('');
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { url?: string } };
if (cur?.options?.url) url.value = decodeURIComponent(cur.options.url);
function save() {
  if (!url.value) return;
  uni.downloadFile({
    url: url.value,
    success: (r) => uni.saveImageToPhotosAlbum({ filePath: r.tempFilePath, success: () => uni.showToast({ title: '已保存' }) }),
  });
}
</script>
<style scoped>.page{background:#000;min-height:100vh;display:flex;align-items:center;}
.img{width:100%;}
</style>`,
  'couple/timeline.vue': `<template>
  <view class="page">
    <EmptyState v-if="!list.length" text="绑定情侣后，日记与纪念日会出现在时间轴" />
    <view v-for="(item,i) in list" :key="i" class="line">
      <view class="dot" /><view class="card love-card"><text class="d">{{ item.date }}</text><text>{{ item.text }}</text></view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import { getAnniversaryList } from '@/api/anniversary';
import EmptyState from '@/components/EmptyState.vue';
const list = ref<{ date: string; text: string }[]>([]);
onShow(async () => {
  const [d, a] = await Promise.all([getDiaryList({ page: 1, pageSize: 20 }), getAnniversaryList().catch(() => ({ list: [] }))]);
  const rows: { date: string; text: string }[] = [];
  ((d.list as any[]) || []).forEach((x) => rows.push({ date: String(x.createdAt).slice(0, 10), text: x.title || x.content?.slice(0, 40) }));
  ((a.list as any[]) || []).forEach((x) => rows.push({ date: x.anniversaryDate, text: '纪念日：' + x.title }));
  list.value = rows.sort((x, y) => y.date.localeCompare(x.date));
});
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx 24rpx 24rpx 48rpx;background:$love-bg;min-height:100vh;}
.line{position:relative;padding-left:32rpx;margin-bottom:24rpx;border-left:4rpx solid $love-primary;}
.dot{position:absolute;left:-10rpx;top:8rpx;width:16rpx;height:16rpx;background:$love-primary;border-radius:50%;}
.card{padding:20rpx;}
.d{font-size:22rpx;color:$love-text-muted;display:block;margin-bottom:8rpx;}
</style>`,
  'couple/album.vue': `<template>
  <view class="page">
    <EmptyState v-if="!imgs.length" text="公开日记中的图片会汇总到相册" />
    <view class="grid">
      <image v-for="(u,i) in imgs" :key="i" :src="u" mode="aspectFill" class="cell" @tap="preview(i)" />
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getDiaryList } from '@/api/diary';
import EmptyState from '@/components/EmptyState.vue';
const imgs = ref<string[]>([]);
onShow(async () => {
  const res = await getDiaryList({ page: 1, pageSize: 30 });
  const arr: string[] = [];
  ((res.list as any[]) || []).forEach((x) => ((x.mediaList as {url:string}[]) || []).forEach((m) => arr.push(m.url)));
  imgs.value = arr;
});
</script>
<style lang="scss" scoped>@import '@/styles/common.scss';
.page{padding:24rpx;background:$love-bg;min-height:100vh;}
.grid{display:flex;flex-wrap:wrap;gap:8rpx;}
.cell{width:240rpx;height:240rpx;border-radius:8rpx;}
</style>`,
});

pages['couple/album-detail.vue'] = `<template>
  <view class="page">
    <swiper class="sw"><swiper-item v-for="(u,i) in urls" :key="i"><image :src="u" mode="aspectFit" class="img" /></swiper-item></swiper>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const urls = ref<string[]>([]);
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { urls?: string } };
if (cur?.options?.urls) urls.value = decodeURIComponent(cur.options.urls).split(',');
</script>
<style scoped>.sw{height:100vh;}.img{width:100%;height:100%;}</style>`;

let n = 0;
for (const [rel, content] of Object.entries(pages)) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  n++;
}
console.log('Generated', n, 'production pages');
