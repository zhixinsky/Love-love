<template>
  <div v-loading="loading" class="page">
    <h2>P055 内容审核</h2>
    <p class="sub">待审动态与关联举报</p>

    <h3>待审动态（{{ posts.length }}）</h3>
    <el-table :data="posts" stripe empty-text="暂无待审动态" style="margin-bottom: 32px">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip min-width="240" />
      <el-table-column prop="userId" label="用户" width="100" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="handle('post', row.id, 'approve')">
            通过
          </el-button>
          <el-button size="small" type="danger" @click="handle('post', row.id, 'reject')">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <h3>待处理举报（{{ reports.length }}）</h3>
    <el-table :data="reports" stripe empty-text="暂无待处理举报">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="reason" label="原因" min-width="160" />
      <el-table-column prop="targetType" label="类型" width="90" />
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" @click="handle('report', row.id, 'approve')">
            标记已处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
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
  ElMessage.success('操作成功');
  await load();
}

onMounted(load);
</script>

<style scoped>
.page h2 {
  margin: 0 0 8px;
}
.sub {
  color: #888;
  margin-bottom: 24px;
}
h3 {
  font-size: 16px;
  margin: 24px 0 12px;
  color: #444;
}
</style>
