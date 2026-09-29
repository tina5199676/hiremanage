import { http } from './http'

import type {
  MarkAllReadResponse,
  MarkReadResponse,
  NotificationListResponse,
  NotificationQuery,
  UnreadCountResponse,
} from '../types/notification'

export async function getNotifications(
  query: NotificationQuery = {},
): Promise<NotificationListResponse> {
  const response = await http.get<NotificationListResponse>(
    '/notifications',
    { params: query },
  )

  return response.data
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await http.get<UnreadCountResponse>(
    '/notifications/unread-count',
  )

  return response.data
}

export async function markNotificationRead(
  id: number,
): Promise<MarkReadResponse> {
  const response = await http.patch<MarkReadResponse>(
    `/notifications/${id}/read`,
  )

  return response.data
}

export async function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  const response = await http.post<MarkAllReadResponse>(
    '/notifications/read-all',
  )

  return response.data
}
