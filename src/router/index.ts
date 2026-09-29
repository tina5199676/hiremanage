import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'

import type { Permission } from '../types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    permission?: Permission
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/admin',
    },

    // --------------------------------------------------
    // Auth
    // --------------------------------------------------

    {
      path: '/login',
      component: () => import('../layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../views/auth/LoginView.vue'),
          meta: { title: '登入' },
        },
      ],
    },

    // --------------------------------------------------
    // Admin
    // --------------------------------------------------

    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardView.vue'),
          meta: { permission: 'dashboard.read', title: '總覽' },
        },

        // Jobs
        {
          path: 'jobs',
          name: 'jobs',
          component: () => import('../views/jobs/JobsView.vue'),
          meta: { permission: 'job.read', title: '職缺管理' },
        },
        {
          path: 'jobs/create',
          name: 'job-create',
          component: () => import('../views/jobs/JobCreateView.vue'),
          meta: { permission: 'job.create', title: '建立職缺' },
        },
        {
          path: 'jobs/:id',
          name: 'job-detail',
          component: () => import('../views/jobs/JobDetailView.vue'),
          meta: { permission: 'job.read', title: '職缺詳細' },
        },
        {
          path: 'jobs/:id/edit',
          name: 'job-edit',
          component: () => import('../views/jobs/JobEditView.vue'),
          meta: { permission: 'job.update', title: '編輯職缺' },
        },

        // Candidates
        {
          path: 'candidates',
          name: 'candidates',
          component: () => import('../views/candidates/CandidatesView.vue'),
          meta: { permission: 'candidate.read', title: '候選人' },
        },
        {
          path: 'candidates/create',
          name: 'candidate-create',
          component: () =>
            import('../views/candidates/CandidateCreateView.vue'),
          meta: { permission: 'candidate.create', title: '新增候選人' },
        },
        {
          path: 'candidates/:id',
          name: 'candidate-detail',
          component: () =>
            import('../views/candidates/CandidateDetailView.vue'),
          meta: { permission: 'candidate.read', title: '候選人詳細' },
        },
        {
          path: 'candidates/:id/edit',
          name: 'candidate-edit',
          component: () =>
            import('../views/candidates/CandidateEditView.vue'),
          meta: { permission: 'candidate.update', title: '編輯候選人' },
        },

        // Applications
        {
          path: 'applications',
          name: 'applications',
          component: () =>
            import('../views/applications/ApplicationsView.vue'),
          meta: { permission: 'application.read', title: '應徵管理' },
        },
        {
          path: 'applications/create',
          name: 'application-create',
          component: () =>
            import('../views/applications/ApplicationCreateView.vue'),
          meta: { permission: 'application.create', title: '建立應徵' },
        },
        {
          path: 'applications/:id',
          name: 'application-detail',
          component: () =>
            import('../views/applications/ApplicationDetailView.vue'),
          meta: { permission: 'application.read', title: '應徵詳細' },
        },
      ],
    },

    // --------------------------------------------------
    // Errors
    // --------------------------------------------------

    {
      path: '/403',
      name: 'forbidden',
      component: () => import('../views/errors/ForbiddenView.vue'),
      meta: { title: '沒有存取權限' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/errors/NotFoundView.vue'),
      meta: { title: '找不到頁面' },
    },
  ],
})

// --------------------------------------------------
// Navigation guards
// --------------------------------------------------

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.initialize()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

  if (guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  const permission = to.meta.permission

  if (permission && !authStore.can(permission)) {
    return { name: 'forbidden' }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title

  document.title = title ? `${title} | HireManage` : 'HireManage'
})

export default router
