<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppPagination from '../../components/AppPagination.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useNotificationStore } from '../../stores/notification'
import { formatDateTime, formatRelativeTime } from '../../utils/formatters'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_TONES,
} from '../../utils/labels'

import type { Notification } from '../../types/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

const unreadOnly = computed(() => notificationStore.query.unreadOnly ?? false)

const markingAll = ref(false)

function setUnreadOnly(value: boolean) {
  notificationStore.setQuery({ unreadOnly: value, page: 1 })
  notificationStore.fetchNotifications()
}

function goToPage(page: number) {
  notificationStore.setQuery({ page })
  notificationStore.fetchNotifications()
}

async function markAllRead() {
  markingAll.value = true

  await notificationStore.markAllRead()

  markingAll.value = false

  if (unreadOnly.value) {
    notificationStore.fetchNotifications()
  }
}

async function openNotification(notification: Notification) {
  if (!notification.read) {
    await notificationStore.markRead(notification.id)
  }

  if (notification.link) {
    router.push(notification.link)
  }
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>

<template>
  <div>
    <PageHeader
      title="通知"
      description="面試安排、應徵狀態與 Offer 的最新動態"
    >
      <template #actions>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="markingAll || notificationStore.unreadCount === 0"
          @click="markAllRead"
        >
          {{ markingAll ? '處理中...' : '全部標示為已讀' }}
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-4xl px-6 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="篩選通知"
          class="inline-flex rounded-lg border border-slate-300 p-0.5"
        >
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-500"
            :class="
              !unreadOnly
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            "
            :aria-pressed="!unreadOnly"
            @click="setUnreadOnly(false)"
          >
            全部
          </button>

          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-500"
            :class="
              unreadOnly
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            "
            :aria-pressed="unreadOnly"
            @click="setUnreadOnly(true)"
          >
            未讀
          </button>
        </div>

        <p
          class="text-sm text-slate-600"
          aria-live="polite"
        >
          未讀
          <span class="font-semibold text-slate-900">
            {{ notificationStore.unreadCount }}
          </span>
          則
        </p>
      </div>

      <ErrorState
        v-if="notificationStore.error"
        class="mt-4"
        :message="notificationStore.error"
        show-retry
        @retry="notificationStore.fetchNotifications()"
      />

      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState v-if="notificationStore.loading" />

        <EmptyState
          v-else-if="notificationStore.notifications.length === 0"
          :title="unreadOnly ? '沒有未讀通知' : '目前沒有通知'"
        />

        <ul
          v-else
          class="divide-y divide-slate-200"
        >
          <li
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
          >
            <button
              type="button"
              class="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              :class="notification.read ? '' : 'bg-blue-50/40'"
              @click="openNotification(notification)"
            >
              <span
                aria-hidden="true"
                class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                :class="notification.read ? 'bg-transparent' : 'bg-blue-600'"
              />

              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-2">
                  <span
                    class="text-sm text-slate-900"
                    :class="notification.read ? 'font-medium' : 'font-semibold'"
                  >
                    {{ notification.title }}
                  </span>

                  <StatusBadge
                    :label="NOTIFICATION_TYPE_LABELS[notification.type]"
                    :tone="NOTIFICATION_TYPE_TONES[notification.type]"
                  />

                  <span
                    v-if="!notification.read"
                    class="sr-only"
                  >
                    未讀
                  </span>
                </span>

                <span class="mt-1 block text-sm text-slate-600">
                  {{ notification.message }}
                </span>

                <span
                  class="mt-1 block text-xs text-slate-500"
                  :title="formatDateTime(notification.createdAt)"
                >
                  {{ formatRelativeTime(notification.createdAt) }}
                </span>
              </span>
            </button>
          </li>
        </ul>

        <AppPagination
          v-if="!notificationStore.loading && notificationStore.pagination.totalPages > 1"
          :page="notificationStore.pagination.page"
          :page-size="notificationStore.pagination.pageSize"
          :total="notificationStore.pagination.total"
          :total-pages="notificationStore.pagination.totalPages"
          aria-label="通知分頁"
          @update:page="goToPage"
        />
      </section>
    </div>
  </div>
</template>
