import type { ApiListResponse, ApiMessageResponse } from './common'

export type NotificationType =
  | 'interview_scheduled'
  | 'application_updated'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'system'

export interface Notification {
  id: number
  /** 收件者 user id */
  userId: number
  type: NotificationType
  title: string
  message: string
  /** 點擊後導向的頁面 */
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationQuery {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

export type NotificationListResponse = ApiListResponse<Notification> & {
  unreadCount: number
}

export interface UnreadCountResponse {
  success: boolean
  data: {
    unreadCount: number
  }
}

export interface MarkReadResponse {
  success: boolean
  data: Notification | null
  message?: string
}

export type MarkAllReadResponse = ApiMessageResponse
