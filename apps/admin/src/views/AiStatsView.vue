<template>
  <div v-loading="loading" class="page">
    <h2>P057 AI 统计</h2>
    <p class="sub">调用量、Token 成本与周报生成情况</p>
    <el-row :gutter="16">
      <el-col :xs="24" :sm="8" v-for="c in cardList" :key="c.label">
        <el-card shadow="hover" class="card">
          <div class="stat">{{ c.value }}</div>
          <div class="label">{{ c.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="scene" shadow="never">
      <template #header>热门场景（估算）</template>
      <el-table :data="scenes" size="small">
        <el-table-column prop="scene" label="场景" />
        <el-table-column prop="count" label="调用占比" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getAiStats } from '@/api/admin';

const loading = ref(false);
const stats = ref<Record<string, number>>({});

const cardList = computed(() => [
  { label: 'AI 周报生成数', value: stats.value.reportCount ?? 0 },
  { label: 'AI 对话/分析调用', value: stats.value.usageCount ?? 0 },
  { label: '累计 Token（估算）', value: stats.value.totalTokens ?? 0 },
]);

const scenes = computed(() => [
  { scene: 'AI 私聊', count: '约 55%' },
  { scene: '恋爱周报', count: '约 25%' },
  { scene: '恋爱分析', count: '约 20%' },
]);

onMounted(async () => {
  loading.value = true;
  try {
    stats.value = await getAiStats();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page h2 {
  margin: 0 0 8px;
}
.sub {
  color: #888;
  margin-bottom: 24px;
}
.card {
  margin-bottom: 16px;
}
.stat {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b9d;
}
.label {
  margin-top: 8px;
  color: #666;
}
.scene {
  margin-top: 24px;
}
</style>
