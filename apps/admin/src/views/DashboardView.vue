<template>
  <div v-loading="loading" class="dashboard">
    <h2 class="title">P053 数据看板</h2>
    <p class="sub">恋恋 APP 核心运营指标一览</p>
    <el-row :gutter="16" class="cards">
      <el-col v-for="item in cards" :key="item.label" :xs="12" :sm="8" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat">{{ item.value }}</div>
          <div class="label">{{ item.label }}</div>
          <div v-if="item.hint" class="hint">{{ item.hint }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="tips" shadow="never">
      <template #header>运营提示</template>
      <ul>
        <li>待处理举报需及时在「举报中心」处理</li>
        <li>待审内容在「内容审核」通过/拒绝</li>
        <li>AI 调用量异常时请检查 OPENAI 配置与额度</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import http from '@/api/http';

const loading = ref(false);
const cards = ref([
  { label: '注册用户', value: 0, hint: '' },
  { label: '日记总数', value: 0, hint: '' },
  { label: '动态总数', value: 0, hint: '' },
  { label: '待处理举报', value: 0, hint: '需处理' },
  { label: '情侣绑定数', value: 0, hint: '' },
  { label: '绑定率', value: '0%', hint: '情侣/用户' },
  { label: 'AI 调用次数', value: 0, hint: '' },
]);

onMounted(async () => {
  loading.value = true;
  try {
    const d = (await http.get('/admin/dashboard')) as Record<string, number>;
    cards.value = [
      { label: '注册用户', value: d.userCount ?? 0, hint: '' },
      { label: '日记总数', value: d.diaryCount ?? 0, hint: '' },
      { label: '动态总数', value: d.postCount ?? 0, hint: '' },
      {
        label: '待处理举报',
        value: d.reportPending ?? 0,
        hint: d.reportPending ? '需处理' : '',
      },
      { label: '情侣绑定数', value: d.coupleCount ?? 0, hint: '' },
      {
        label: '绑定率',
        value: `${d.coupleBindRate ?? 0}%`,
        hint: '情侣/用户',
      },
      { label: 'AI 调用次数', value: d.aiUsageCount ?? 0, hint: '' },
    ];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 8px;
}
.title {
  margin: 0 0 4px;
  color: #333;
}
.sub {
  color: #888;
  font-size: 14px;
  margin-bottom: 24px;
}
.stat-card {
  margin-bottom: 16px;
}
.stat {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b9d;
}
.label {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
.hint {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 4px;
}
.tips ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.8;
}
</style>
