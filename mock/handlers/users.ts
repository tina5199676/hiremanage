import { http, HttpResponse } from 'msw'

import { users, toPublicUser } from '../data/users'
import { requireAuth } from '../utils/auth'

export const userHandlers = [
  // --------------------------------------------------
  // GET /api/users
  // 供表單選擇面試官使用，任何已登入的使用者皆可讀取
  // --------------------------------------------------

  http.get('/api/users', ({ request }) => {
    const auth = requireAuth(request)

    if (!auth.ok) {
      return auth.response
    }

    return HttpResponse.json({
      success: true,
      data: users.map(toPublicUser),
    })
  }),
]
