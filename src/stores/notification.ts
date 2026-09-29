import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage } from '../services/http'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService'

import type { PaginationMeta } from '../types/common'
import type {
  Notification,
  NotificationQuery,
} from '../types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const unreadCount = ref(0)

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<NotificationQuery>({
    unreadOnly: false,
    page: 1,
    pageSize: 10,
  })

  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  async function fetchNotifications() {
    loading.value = true
    error.value = null

    try {
      const response = await getNotifications(query.value)

      notifications.value = response.data
      pagination.value = response.meta
      unreadCount.value = response.unreadCount
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得通知')
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await getUnreadCount()

      unreadCount.value = response.data.unreadCount
    } catch {
      // 未讀數量僅為輔助資訊，失敗時不影響主要流程
    }
  }

  async function markRead(id: number): Promise<boolean> {
    try {
      const response = await markNotificationRead(id)

      const target = notifications.value.find((item) => item.id === id)

      if (target && !target.read) {
        target.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      return response.success
    } catch (err) {
      error.value = getErrorMessage(err, '無法更新通知')

      return false
    }
  }

  async function markAllRead(): Promise<boolean> {
    try {
      await markAllNotificationsRead()

      notifications.value.forEach((item) => {
        item.read = true
      })

      unreadCount.value = 0

      return true
    } catch (err) {
      error.value = getErrorMessage(err, '無法更新通知')

      return false
    }
  }

  function setQuery(newQuery: Partial<NotificationQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function reset() {
    notifications.value = []
    unreadCount.value = 0
    error.value = null
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    query,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    setQuery,
    reset,
  }
})
