<template>
  <div v-loading="loading">
    <el-table :data="list">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="targetType" label="类型" width="100" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column prop="createdAt" label="时间" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getReportList } from '@/api/admin';

const loading = ref(false);
const list = ref<Record<string, unknown>[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await getReportList({ page: 1, pageSize: 50 });
    list.value = (res.list as Record<string, unknown>[]) || [];
  } finally {
    loading.value = false;
  }
});
</script>
