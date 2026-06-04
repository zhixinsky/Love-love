<template>
  <view class="chat-page">
    <view class="header love-card">
      <text class="av">🤖</text>
      <view>
        <text class="name">恋恋 AI</text>
        <text class="sub">情感陪伴 · 读懂你的日记</text>
      </view>
      <text class="mem-toggle" @tap="useMemory = !useMemory">
        {{ useMemory ? '记忆开' : '记忆关' }}
      </text>
    </view>

    <scroll-view scroll-y class="msgs" :scroll-into-view="scrollId">
      <view v-if="sending" class="typing">恋恋正在输入...</view>
      <view
        v-for="m in messages"
        :id="'m' + m.id"
        :key="m.id"
        class="row"
        :class="{ mine: m.role === 'user' }"
      >
        <text v-if="m.role === 'ai'" class="mini-av">💕</text>
        <view class="bubble">{{ m.text }}</view>
      </view>
    </scroll-view>

    <scroll-view v-if="quickQs.length" scroll-x class="quick" :show-scrollbar="false">
      <text v-for="q in quickQs" :key="q" class="q-chip" @tap="useQuick(q)">{{ q }}</text>
    </scroll-view>

    <view class="input-bar">
      <input
        v-model="input"
        class="inp"
        placeholder="和恋恋说点什么..."
        :disabled="sending"
        @confirm="send"
      />
      <view class="send" :class="{ off: sending }" @tap="send">发送</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { aiChat, createAiSession } from '@/api/ai';
import { getMessageList } from '@/api/chat';

const sessionId = ref(0);
const input = ref('');
const useMemory = ref(true);
const scrollId = ref('');
const sending = ref(false);
const messages = ref<{ id: number; role: string; text: string }[]>([]);
let mid = 0;

const quickQs = [
  '今天有点不开心',
  '和伴侣吵架了怎么办',
  '纪念日怎么更有仪式感',
  '异地恋如何维持亲密',
  '帮我分析最近的情绪',
];

onMounted(async () => {
  const s = await createAiSession();
  sessionId.value = Number(s.sessionId);
  await loadHistory();
  if (!messages.value.length) {
    messages.value.push({
      id: ++mid,
      role: 'ai',
      text: '你好，我是恋恋 💕 感情里开心或难过的事，都可以和我说。',
    });
  }
});

async function loadHistory() {
  const res = await getMessageList(sessionId.value, { page: 1, pageSize: 50 });
  const list = (res.list as { id: string; isMine: boolean; content: string }[]) || [];
  if (list.length) {
    messages.value = list.map((m) => ({
      id: ++mid,
      role: m.isMine ? 'user' : 'ai',
      text: m.content,
    }));
    const last = messages.value[messages.value.length - 1];
    if (last) scrollId.value = 'm' + last.id;
  }
}

function useQuick(q: string) {
  input.value = q;
  send();
}

async function send() {
  if (!input.value.trim() || sending.value) return;
  const text = input.value;
  input.value = '';
  messages.value.push({ id: ++mid, role: 'user', text });
  scrollId.value = 'm' + mid;
  sending.value = true;
  try {
    const res = await aiChat({
      sessionId: sessionId.value,
      content: text,
      useDiaryMemory: useMemory.value,
    });
    messages.value.push({ id: ++mid, role: 'ai', text: res.reply as string });
    scrollId.value = 'm' + mid;
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '发送失败',
      icon: 'none',
    });
  } finally {
    sending.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $love-bg;
}
.header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin: 16rpx 16rpx 0;
  flex-shrink: 0;
}
.av {
  font-size: 48rpx;
  margin-right: 16rpx;
}
.name {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.sub {
  font-size: 22rpx;
  color: $love-text-muted;
  display: block;
}
.mem-toggle {
  margin-left: auto;
  font-size: 22rpx;
  color: $love-primary;
  background: #fff5f8;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}
.msgs {
  flex: 1;
  padding: 24rpx;
  height: 0;
}
.typing {
  font-size: 24rpx;
  color: $love-text-muted;
  margin-bottom: 12rpx;
}
.row {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-end;
}
.row.mine {
  justify-content: flex-end;
}
.mini-av {
  font-size: 32rpx;
  margin-right: 8rpx;
}
.bubble {
  max-width: 78%;
  background: #fff;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  line-height: 1.55;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}
.row.mine .bubble {
  background: linear-gradient(135deg, $love-primary, #ff8fab);
  color: #fff;
}
.quick {
  white-space: nowrap;
  padding: 12rpx 16rpx;
  background: #fff;
  flex-shrink: 0;
}
.q-chip {
  display: inline-block;
  margin-right: 12rpx;
  padding: 10rpx 20rpx;
  background: $love-bg;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $love-text-muted;
}
.input-bar {
  display: flex;
  padding: 16rpx;
  background: #fff;
  gap: 12rpx;
  flex-shrink: 0;
}
.inp {
  flex: 1;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
}
.send {
  line-height: 72rpx;
  color: $love-primary;
  font-weight: 600;
  padding: 0 16rpx;
}
.send.off {
  opacity: 0.4;
}
</style>
