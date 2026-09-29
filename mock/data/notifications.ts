import type { Notification } from '../../src/types/notification'

export const notifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: 'system',
    title: '系統通知',
    message: 'HireManage 已完成本週資料備份。',
    link: null,
    read: true,
    createdAt: '2026-09-20T02:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    type: 'application_updated',
    title: '應徵狀態更新',
    message: '陳柏宇（Frontend Engineer）已進入 Interview 階段。',
    link: '/admin/applications',
    read: false,
    createdAt: '2026-09-25T06:30:00Z',
  },
  {
    id: 3,
    userId: 2,
    type: 'interview_scheduled',
    title: '面試已排定',
    message: '林詩涵的 Backend Engineer 技術面試已排定於 09/30 10:00。',
    link: '/admin/interviews',
    read: false,
    createdAt: '2026-09-26T01:15:00Z',
  },
  {
    id: 4,
    userId: 2,
    type: 'offer_accepted',
    title: 'Offer 已接受',
    message: '黃俊傑已接受 Product Manager 的 Offer。',
    link: '/admin/offers',
    read: false,
    createdAt: '2026-09-27T08:45:00Z',
  },
  {
    id: 5,
    userId: 2,
    type: 'application_updated',
    title: '新的應徵',
    message: '吳雅雯應徵了 UI/UX Designer。',
    link: '/admin/applications',
    read: true,
    createdAt: '2026-09-22T03:20:00Z',
  },
  {
    id: 6,
    userId: 3,
    type: 'interview_scheduled',
    title: '面試邀請',
    message: '您被指派為陳柏宇 Frontend Engineer 技術面試的面試官。',
    link: '/admin/interviews',
    read: false,
    createdAt: '2026-09-26T05:00:00Z',
  },
  {
    id: 7,
    userId: 3,
    type: 'system',
    title: '請填寫面試回饋',
    message: '您有 1 場已完成的面試尚未填寫回饋。',
    link: '/admin/interviews',
    read: false,
    createdAt: '2026-09-28T01:00:00Z',
  },
]

let nextNotificationId = notifications.length + 1

export function pushNotification(
  input: Omit<Notification, 'id' | 'read' | 'createdAt'>,
): Notification {
  const notification: Notification = {
    ...input,
    id: nextNotificationId,
    read: false,
    createdAt: new Date().toISOString(),
  }

  nextNotificationId += 1

  notifications.unshift(notification)

  return notification
}
