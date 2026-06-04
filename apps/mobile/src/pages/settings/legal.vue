<template>
  <view class="page">
    <text class="title">{{ title }}</text>
    <scroll-view scroll-y class="scroll">
      <text class="body">{{ content }}</text>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const type = ref('privacy');
const pages = getCurrentPages();
const cur = pages[pages.length - 1] as { options?: { type?: string } };
if (cur?.options?.type) type.value = cur.options.type;

const title = computed(() =>
  type.value === 'terms' ? '用户协议' : '隐私政策',
);

const content = computed(() =>
  type.value === 'terms' ? TERMS_TEXT : PRIVACY_TEXT,
);

const TERMS_TEXT = `恋恋用户服务协议

1. 服务说明
恋恋提供恋爱日记、广场动态、情侣空间、AI 情感陪伴等功能。使用本服务即表示您已阅读并同意本协议。

2. 账号与安全
您应使用本人手机号注册，妥善保管验证码与登录态。禁止出租、出借账号。

3. 用户内容规范
不得发布违法、色情、暴力、骚扰、虚假广告等内容。平台有权下架内容并对违规账号限制或封禁。

4. 情侣绑定
邀请码仅用于情侣关系绑定，请勿泄露给非预期对象。

5. 免责声明
AI 回复仅供参考，不构成专业心理咨询或医疗建议。

6. 协议变更
我们可能更新本协议，继续使用视为接受更新版本。`;

const PRIVACY_TEXT = `恋恋隐私政策

1. 我们收集的信息
- 手机号：用于注册登录与账号安全
- 您主动填写的内容：昵称、头像、日记、动态、聊天消息
- 位置信息：仅在您授权后用于「附近的人」与同城动态

2. 信息使用
用于提供核心功能、改进产品体验、处理举报与违规内容。

3. AI 功能
在您开启「结合日记记忆」时，系统会读取日记摘要用于生成回复，不会将完整日记出售给第三方。

4. 存储与安全
数据存储于受保护的服务器，我们采取合理技术措施防止未授权访问。

5. 您的权利
您可在设置中编辑资料、管理黑名单，并可联系我们注销账号。

6. 联系我们
admin@dokor.cn`;
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.page {
  padding: 24rpx;
  background: $love-bg;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
  display: block;
}
.scroll {
  flex: 1;
  height: 0;
}
.body {
  font-size: 28rpx;
  line-height: 1.75;
  color: $love-text;
  white-space: pre-wrap;
  display: block;
  padding-bottom: 48rpx;
}
</style>
