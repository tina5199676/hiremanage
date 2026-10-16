import { http, HttpResponse } from 'msw'

import { pushAuditLog } from '../data/auditLogs'
import { users, toPublicUser } from '../data/users'
import {
  createToken,
  resolveUserFromRequest,
  unauthorizedResponse,
} from '../utils/auth'

import type { LoginInput } from '../../src/types/auth'

export const authHandlers = [
  // --------------------------------------------------
  // POST /api/auth/login
  // --------------------------------------------------

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as Partial<LoginInput>

    if (!body.username || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          message: '請輸入帳號與密碼',
        },
        { status: 400 },
      )
    }

    const record = users.find(
      (user) =>
        user.username === body.username &&
        user.password !== null &&
        user.password === body.password,
    )

    if (!record) {
      return HttpResponse.json(
        {
          success: false,
          message: '帳號或密碼錯誤',
        },
        { status: 401 },
      )
    }

    const user = toPublicUser(record)

    pushAuditLog(user, {
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      targetName: user.name,
      details: '使用者登入',
    })

    return HttpResponse.json({
      success: true,
      data: {
        token: createToken(record.id),
        user,
      },
    })
  }),

  // --------------------------------------------------
  // GET /api/auth/me
  // --------------------------------------------------

  http.get('/api/auth/me', ({ request }) => {
    const user = resolveUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    return HttpResponse.json({
      success: true,
      data: user,
    })
  }),

  // --------------------------------------------------
  // POST /api/auth/logout
  // --------------------------------------------------

  http.post('/api/auth/logout', ({ request }) => {
    const user = resolveUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    pushAuditLog(user, {
      action: 'logout',
      targetType: 'user',
      targetId: user.id,
      targetName: user.name,
      details: '使用者登出',
    })

    return HttpResponse.json({
      success: true,
      message: '已登出',
    })
  }),
]
