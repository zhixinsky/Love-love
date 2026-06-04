import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { title: 'P053 数据看板' } },
      { path: 'user', name: 'User', component: () => import('@/views/UserManageView.vue'), meta: { title: 'P054 用户管理' } },
      { path: 'audit', name: 'Audit', component: () => import('@/views/ContentAuditView.vue'), meta: { title: 'P055 内容审核' } },
      { path: 'report', name: 'Report', component: () => import('@/views/ReportCenterView.vue'), meta: { title: 'P056 举报中心' } },
      { path: 'ai-stats', name: 'AiStats', component: () => import('@/views/AiStatsView.vue'), meta: { title: 'P057 AI统计' } },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token');
  if (!to.meta.public && !token) {
    next('/login');
    return;
  }
  next();
});
