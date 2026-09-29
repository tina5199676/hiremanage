import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/admin',
    },

    {
      path: '/admin',
      name: 'dashboard',
      component: () =>
        import(
          '../views/dashboard/DashboardView.vue'
        ),
    },

    {
      path: '/admin/jobs',
      name: 'jobs',
      component: () =>
        import(
          '../views/jobs/JobsView.vue'
        ),
    },

    {
      path: '/admin/jobs/create',
      name: 'job-create',
      component: () =>
        import(
          '../views/jobs/JobCreateView.vue'
        ),
    },

    {
      path: '/admin/jobs/:id',
      name: 'job-detail',
      component: () =>
        import(
          '../views/jobs/JobDetailView.vue'
        ),
    },

    {
      path: '/admin/jobs/:id/edit',
      name: 'job-edit',
      component: () =>
        import(
          '../views/jobs/JobEditView.vue'
        ),
    },

    {
      path: '/admin/candidates',
      name: 'candidates',
      component: () =>
        import(
          '../views/candidates/CandidatesView.vue'
        ),
    },

    {
      path: '/admin/candidates/:id',
      name: 'candidate-detail',
      component: () =>
        import(
          '../views/candidates/CandidateDetailView.vue'
        ),
    },
  ],
})

export default router