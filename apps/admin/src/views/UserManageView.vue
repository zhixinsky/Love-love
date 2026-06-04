<template>
  <div v-loading="loading" class="page">
    <h2>P054 用户管理</h2>
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="昵称 / 手机号"
        clearable
        style="width: 260px"
        @clear="load"
      />
      <el-button type="primary" @click="load">搜索</el-button>
    </div>
    <el-table :data="list" stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="mobile" label="手机" width="130" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '封禁' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" min-width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 1"
            size="small"
            type="danger"
            @click="ban(row)"
          >
            封禁
          </el-button>
          <el-button v-else size="small" type="success" @click="unban(row)">
            解封
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <p class="total">共 {{ total }} 条</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, setUserStatus } from '@/api/admin';

const loading = ref(false);
const keyword = ref('');
const list = ref<Record<string, unknown>[]>([]);
const total = ref(0);

async function load() {
  loading.value = true;
  try {
    const res = await getUserList({
      page: 1,
      pageSize: 50,
      keyword: keyword.value || undefined,
    });
    list.value = (res.list as Record<string, unknown>[]) || [];
    total.value = res.total ?? list.value.length;
  } finally {
    loading.value = false;
  }
}

async function ban(row: { id: string | number; nickname?: string }) {
  await ElMessageBox.confirm(`确定封禁用户「${row.nickname || row.id}」？`, '封禁确认');
  await setUserStatus(row.id, 0);
  ElMessage.success('已封禁');
  load();
}

async function unban(row: { id: string | number }) {
  await setUserStatus(row.id, 1);
  ElMessage.success('已解封');
  load();
}

onMounted(load);
</script>

<style scoped>
.page h2 {
  margin: 0 0 16px;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.total {
  margin-top: 12px;
  color: #888;
  font-size: 13px;
}
</style>
