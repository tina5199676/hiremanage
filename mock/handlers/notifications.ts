import { http, HttpResponse } from 'msw'

import { notifications } from '../data/notifications'
import { requireAuth } from '../utils/auth'

export const notificationHandlers = [
  // --------------------------------------------------
  // GET /api/notifications
  // --------------------------------------------------

  http.get('/api/notifications', ({ request }) => {
    const auth = requireAuth(request, 'notification.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

    const page = Number(url.searchParams.get('page') ?? 1)

    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    const mine = notifications
      .filter((item) => item.userId === auth.user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )

    const unreadCount = mine.filter((item) => !item.read).length

    const result = unreadOnly
      ? mine.filter((item) => !item.read)
      : mine

    const total = result.length

    const totalPages = Math.ceil(total / pageSize)

    const startIndex = (page - 1) * pageSize

    return HttpResponse.json({
      success: true,
      data: result.slice(startIndex, startIndex + pageSize),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
      unreadCount,
    })
  }),

  // --------------------------------------------------
  // GET /api/notifications/unread-count
  // --------------------------------------------------

  http.get('/api/notifications/unread-count', ({ request }) => {
    const auth = requireAuth(request, 'notification.read')

    if (!auth.ok) {
      return auth.response
    }

    const unreadCount = notifications.filter(
      (item) => item.userId === auth.user.id && !item.read,
    ).length

    return HttpResponse.json({
      success: true,
      data: { unreadCount },
    })
  }),

  // --------------------------------------------------
  // PATCH /api/notifications/:id/read
  // --------------------------------------------------

  http.patch('/api/notifications/:id/read', ({ params, request }) => {
    const auth = requireAuth(request, 'notification.read')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const notification = notifications.find(
      (item) => item.id === id && item.userId === auth.user.id,
    )

    if (!notification) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定通知',
          data: null,
        },
        { status: 404 },
      )
    }

    notification.read = true

    return HttpResponse.json({
      success: true,
      data: notification,
    })
  }),

  // --------------------------------------------------
  // POST /api/notifications/read-all
  // --------------------------------------------------

  http.post('/api/notifications/read-all', ({ request }) => {
    const auth = requireAuth(request, 'notification.read')

    if (!auth.ok) {
      return auth.response
    }

    notifications
      .filter((item) => item.userId === auth.user.id)
      .forEach((item) => {
        item.read = true
      })

    return HttpResponse.json({
      success: true,
      message: '已將全部通知標示為已讀',
    })
  }),
]
