<template>
  <div v-loading="loading" class="page">
    <h2>P056 举报中心</h2>
    <p class="sub">用户举报记录与处理状态</p>
    <el-table :data="list" stripe empty-text="暂无举报">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="对象类型" width="100">
        <template #default="{ row }">
          {{ typeLabel(row.targetType) }}
        </template>
      </el-table-column>
      <el-table-column prop="targetId" label="对象ID" width="100" />
      <el-table-column prop="reason" label="原因" min-width="180" show-overflow-tooltip />
      <el-table-column prop="reasonType" label="分类" width="80" />
      <el-table-column prop="createdAt" label="举报时间" width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'warning' : 'info'" size="small">
            {{ row.status === 0 ? '待处理' : '已处理' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <p class="total">本页 {{ list.length }} 条待处理</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getReportList } from '@/api/admin';

const loading = ref(false);
const list = ref<Record<string, unknown>[]>([]);

function typeLabel(t: number) {
  const m: Record<number, string> = {
    1: '动态',
    2: '用户',
    3: '评论',
  };
  return m[t] || String(t);
}

onMounted(async () => {
  loading.value = true;
  try {
    const res = await getReportList({ page: 1, pageSize: 100 });
    list.value = (res.list as Record<string, unknown>[]) || [];
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
  margin-bottom: 20px;
}
.total {
  margin-top: 12px;
  color: #888;
  font-size: 13px;
}
</style>
