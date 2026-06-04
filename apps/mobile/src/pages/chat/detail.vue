<template>
  <view class="page">
    <view v-if="targetUserId" class="top-bar">
      <text class="more" @tap="showMore">更多</text>
    </view>
    <scroll-view scroll-y class="msgs" :scroll-into-view="scrollId">
      <view v-if="!messages.length && !loading" class="empty">打个招呼吧～</view>
      <view
        v-for="m in messages"
        :id="'m' + m.id"
        :key="m.id"
        class="row"
        :class="{ mine: m.isMine }"
      >
        <view
          v-if="m.messageType === 2 && m.mediaUrl"
          class="bubble img-bubble"
          @tap="preview(m.mediaUrl)"
        >
          <image :src="m.mediaUrl" mode="widthFix" class="msg-img" />
        </view>
        <view
          v-else-if="m.messageType === 3 && m.mediaUrl"
          class="bubble voice-bubble"
          @tap="playVoice(m.mediaUrl)"
        >
          <text>🎤 语音 {{ voiceDuration(m) }}</text>
        </view>
        <view v-else class="bubble">{{ m.content }}</view>
      </view>
    </scroll-view>
    <view class="bar">
      <text class="icon-btn" @tap="pickImage">🖼</text>
      <text
        class="icon-btn voice-btn"
        :class="{ rec: recording }"
        @touchstart.prevent="startRecord"
        @touchend.prevent="stopRecord"
        @touchcancel.prevent="stopRecord"
      >🎤</text>
      <input
        v-model="text"
        class="inp"
        placeholder="输入消息..."
        confirm-type="send"
        @confirm="sendText"
      />
      <view class="send" @tap="sendText">发送</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getMessageList, sendMessage } from '@/api/chat';
import { blockUser } from '@/api/user';
import { submitReport } from '@/api/report';
import { uploadImageFile, uploadVoiceFile } from '@/utils/upload-file';
import {
  connectChatSocket,
  disconnectChatSocket,
  isChatSocketReady,
  sendChatViaSocket,
  type ChatMessagePayload,
} from '@/utils/chat-socket';

const sessionId = ref('');
const targetUserId = ref('');
const messages = ref<ChatMessagePayload[]>([]);
const text = ref('');
const scrollId = ref('');
const loading = ref(false);
const recording = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let audioCtx: UniApp.InnerAudioContext | null = null;
const recorder = uni.getRecorderManager();

onMounted(() => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as {
    options?: { sessionId?: string; targetUserId?: string };
  };
  sessionId.value = cur?.options?.sessionId || '';
  targetUserId.value = cur?.options?.targetUserId || '';
  initChat();
  if (targetUserId.value) {
    uni.setNavigationBarTitle({ title: '私聊' });
  }

  recorder.onStop(async (res) => {
    recording.value = false;
    if (!res.tempFilePath || res.duration < 500) return;
    try {
      uni.showLoading({ title: '发送中' });
      const url = await uploadVoiceFile(res.tempFilePath);
      await dispatchSend({
        sessionId: Number(sessionId.value),
        content: '[语音]',
        messageType: 3,
        mediaUrl: url,
      });
    } catch (e: unknown) {
      uni.showToast({
        title: e instanceof Error ? e.message : '发送失败',
        icon: 'none',
      });
    } finally {
      uni.hideLoading();
    }
  });
});

onUnmounted(() => {
  disconnectChatSocket();
  if (pollTimer) clearInterval(pollTimer);
  audioCtx?.destroy();
});

async function initChat() {
  await load();
  const ok = await connectChatSocket(sessionId.value, (msg) => {
    appendMessage(msg);
  });
  if (!ok) {
    pollTimer = setInterval(() => pollNew(), 4000);
  }
}

function appendMessage(msg: ChatMessagePayload) {
  if (!msg?.id) return;
  if (messages.value.some((m) => m.id === msg.id)) return;
  messages.value = [...messages.value, msg];
  scrollId.value = 'm' + msg.id;
}

async function pollNew() {
  if (!sessionId.value) return;
  try {
    const res = await getMessageList(Number(sessionId.value), {
      page: 1,
      pageSize: 100,
    });
    const list = (res.list || []) as ChatMessagePayload[];
    if (list.length > messages.value.length) {
      messages.value = list;
      const last = list[list.length - 1];
      if (last) scrollId.value = 'm' + last.id;
    }
  } catch {
    /* ignore poll errors */
  }
}

function showMore() {
  uni.showActionSheet({
    itemList: ['举报用户', '拉黑用户'],
    success: async (res) => {
      if (!targetUserId.value) return;
      if (res.tapIndex === 0) {
        await submitReport({
          targetType: 2,
          targetId: Number(targetUserId.value),
          reasonType: 3,
          reason: '聊天骚扰',
        });
        uni.showToast({ title: '已举报', icon: 'success' });
      } else if (res.tapIndex === 1) {
        await blockUser(Number(targetUserId.value));
        uni.showToast({ title: '已拉黑', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 400);
      }
    },
  });
}

async function load() {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const res = await getMessageList(Number(sessionId.value), {
      page: 1,
      pageSize: 100,
    });
    messages.value = (res.list || []) as ChatMessagePayload[];
    const last = messages.value[messages.value.length - 1];
    if (last) scrollId.value = 'm' + last.id;
  } finally {
    loading.value = false;
  }
}

async function dispatchSend(payload: Record<string, unknown>) {
  if (isChatSocketReady()) {
    sendChatViaSocket(payload);
    await new Promise((r) => setTimeout(r, 300));
    await pollNew();
  } else {
    await sendMessage(payload);
    await load();
  }
}

async function sendText() {
  if (!text.value.trim()) return;
  const content = text.value;
  text.value = '';
  await dispatchSend({
    sessionId: Number(sessionId.value),
    content,
    messageType: 1,
  });
}

function pickImage() {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        uni.showLoading({ title: '发送中' });
        const url = await uploadImageFile(res.tempFilePaths[0]);
        await dispatchSend({
          sessionId: Number(sessionId.value),
          content: '[图片]',
          messageType: 2,
          mediaUrl: url,
        });
      } catch (e: unknown) {
        uni.showToast({
          title: e instanceof Error ? e.message : '发送失败',
          icon: 'none',
        });
      } finally {
        uni.hideLoading();
      }
    },
  });
}

function startRecord() {
  recording.value = true;
  recorder.start({ format: 'mp3', duration: 60000 });
}

function stopRecord() {
  if (!recording.value) return;
  recorder.stop();
}

function playVoice(url: string) {
  if (!url) return;
  if (!audioCtx) audioCtx = uni.createInnerAudioContext();
  audioCtx.src = url;
  audioCtx.play();
}

function voiceDuration(_m: ChatMessagePayload) {
  return '';
}

function preview(url: string) {
  uni.previewImage({ urls: [url], current: url });
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff5f8;
}
.msgs {
  flex: 1;
  padding: 24rpx;
  height: 0;
}
.empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
}
.row {
  display: flex;
  margin-bottom: 12rpx;
}
.row.mine {
  justify-content: flex-end;
}
.bubble {
  max-width: 75%;
  background: #fff;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
}
.row.mine .bubble {
  background: #ff6b9d;
  color: #fff;
}
.voice-bubble {
  min-width: 160rpx;
}
.img-bubble {
  padding: 8rpx;
  background: #fff;
}
.row.mine .img-bubble {
  background: #ff9ec0;
}
.msg-img {
  max-width: 400rpx;
  border-radius: 12rpx;
}
.bar {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #fff;
  gap: 12rpx;
}
.icon-btn {
  font-size: 40rpx;
  padding: 0 8rpx;
}
.voice-btn.rec {
  opacity: 0.5;
  transform: scale(1.1);
}
.inp {
  flex: 1;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 12rpx 20rpx;
}
.send {
  color: #ff6b9d;
  font-weight: 600;
}
.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 12rpx 24rpx;
  background: #fff;
}
.more {
  font-size: 28rpx;
  color: #666;
}
</style>
