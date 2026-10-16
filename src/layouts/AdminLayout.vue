<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { ROLE_LABELS } from '../utils/permissions'

import type { Permission } from '../types/auth'

interface NavItem {
  label: string
  to: string
  permission: Permission
  /** 用來判斷是否 active 的路徑前綴 */
  match: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const navItems: NavItem[] = [
  {
    label: '總覽',
    to: '/admin',
    permission: 'dashboard.read',
    match: '/admin',
  },
  {
    label: '職缺管理',
    to: '/admin/jobs',
    permission: 'job.read',
    match: '/admin/jobs',
  },
  {
    label: '候選人',
    to: '/admin/candidates',
    permission: 'candidate.read',
    match: '/admin/candidates',
  },
  {
    label: '應徵管理',
    to: '/admin/applications',
    permission: 'application.read',
    match: '/admin/applications',
  },
  {
    label: '面試管理',
    to: '/admin/interviews',
    permission: 'interview.read',
    match: '/admin/interviews',
  },
  {
    label: 'Offer 管理',
    to: '/admin/offers',
    permission: 'offer.read',
    match: '/admin/offers',
  },
  {
    label: '通知',
    to: '/admin/notifications',
    permission: 'notification.read',
    match: '/admin/notifications',
  },
  {
    label: '稽核紀錄',
    to: '/admin/audit-logs',
    permission: 'audit.read',
    match: '/admin/audit-logs',
  },
]

const visibleNavItems = computed(() => {
  return navItems.filter((item) => authStore.can(item.permission))
})

function isActive(item: NavItem): boolean {
  if (item.match === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(item.match)
}

const mobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

const userInitial = computed(() => {
  return authStore.user?.name.charAt(0) ?? '?'
})

const roleLabel = computed(() => {
  return authStore.user ? ROLE_LABELS[authStore.user.role] : ''
})

const unreadCount = computed(() => notificationStore.unreadCount)

const loggingOut = ref(false)

onMounted(() => {
  if (authStore.can('notification.read')) {
    notificationStore.fetchUnreadCount()
  }
})

async function handleLogout() {
  loggingOut.value = true

  await authStore.logout()

  notificationStore.reset()

  loggingOut.value = false

  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow"
    >
      跳到主要內容
    </a>

    <!-- Sidebar -->
    <aside
      class="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-b-0 lg:border-r"
    >
      <div class="flex items-center justify-between px-6 py-5">
        <RouterLink
          to="/admin"
          class="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span class="block text-lg font-bold text-slate-900">
            HireManage
          </span>

          <span class="block text-xs text-slate-500">
            智慧面試管理平台
          </span>
        </RouterLink>

        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 lg:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-controls="primary-navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          選單
        </button>
      </div>

      <nav
        id="primary-navigation"
        aria-label="主要導覽"
        class="px-3 pb-4 lg:flex-1"
        :class="mobileMenuOpen ? 'block' : 'hidden lg:block'"
      >
        <ul class="space-y-1">
          <li
            v-for="item in visibleNavItems"
            :key="item.to"
          >
            <RouterLink
              :to="item.to"
              class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="
                isActive(item)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              "
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              <span>{{ item.label }}</span>

              <span
                v-if="item.permission === 'notification.read' && unreadCount > 0"
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  isActive(item)
                    ? 'bg-white text-slate-900'
                    : 'bg-red-600 text-white'
                "
              >
                {{ unreadCount }}
                <span class="sr-only">則未讀通知</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- User -->
      <div
        class="border-t border-slate-200 px-4 py-4"
        :class="mobileMenuOpen ? 'block' : 'hidden lg:block'"
      >
        <div class="flex items-center gap-3">
          <span
            aria-hidden="true"
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            :class="authStore.user?.avatarColor ?? 'bg-slate-500'"
          >
            {{ userInitial }}
          </span>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900">
              {{ authStore.user?.name }}
            </p>

            <p class="truncate text-xs text-slate-500">
              {{ roleLabel }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loggingOut"
          @click="handleLogout"
        >
          {{ loggingOut ? '登出中...' : '登出' }}
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main
      id="main-content"
      tabindex="-1"
      class="min-w-0 flex-1 focus:outline-none"
    >
      <RouterView />
    </main>
  </div>
</template>
