import { http, HttpResponse } from 'msw'

import { auditLogs } from '../data/auditLogs'
import { requireAuth } from '../utils/auth'

export const auditLogHandlers = [
  // --------------------------------------------------
  // GET /api/audit-logs
  // --------------------------------------------------

  http.get('/api/audit-logs', ({ request }) => {
    const auth = requireAuth(request, 'audit.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const search = url.searchParams.get('search')?.toLowerCase()
    const action = url.searchParams.get('action')
    const targetType = url.searchParams.get('targetType')
    const actorId = url.searchParams.get('actorId')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)

    let result = [...auditLogs]

    if (search) {
      result = result.filter((log) => {
        return (
          log.actorName.toLowerCase().includes(search) ||
          log.targetName.toLowerCase().includes(search) ||
          log.details.toLowerCase().includes(search)
        )
      })
    }

    if (action) {
      result = result.filter((log) => log.action === action)
    }

    if (targetType) {
      result = result.filter((log) => log.targetType === targetType)
    }

    if (actorId) {
      result = result.filter((log) => log.actorId === Number(actorId))
    }

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

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
    })
  }),
]
