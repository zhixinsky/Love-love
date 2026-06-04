<template>
  <div v-loading="loading">
    <h3>待审动态</h3>
    <el-table :data="posts" style="width: 100%; margin-bottom: 24px">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="handle('post', row.id, 'approve')">通过</el-button>
          <el-button size="small" type="danger" @click="handle('post', row.id, 'reject')">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <h3>待处理举报</h3>
    <el-table :data="reports">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="handle('report', row.id, 'approve')">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAuditList, handleAudit } from '@/api/admin';

const loading = ref(false);
const posts = ref<Record<string, unknown>[]>([]);
const reports = ref<Record<string, unknown>[]>([]);

async function load() {
  loading.value = true;
  try {
    const res = (await getAuditList()) as { posts?: unknown[]; reports?: unknown[] };
    posts.value = (res.posts as Record<string, unknown>[]) || [];
    reports.value = (res.reports as Record<string, unknown>[]) || [];
  } finally {
    loading.value = false;
  }
}

async function handle(targetType: string, targetId: unknown, action: string) {
  await handleAudit({ targetType, targetId, action });
  await load();
}

onMounted(load);
</script>
