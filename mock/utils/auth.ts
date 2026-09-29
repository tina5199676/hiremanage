import { HttpResponse } from 'msw'

import { hasPermission } from '../../src/utils/permissions'
import { users, toPublicUser } from '../data/users'

import type { Permission, User } from '../../src/types/auth'

const TOKEN_PREFIX = 'mock-token-'

export function createToken(userId: number): string {
  return `${TOKEN_PREFIX}${userId}`
}

export function resolveUserFromRequest(
  request: Request,
): User | null {
  const header = request.headers.get('Authorization')

  if (!header || !header.startsWith('Bearer ')) {
    return null
  }

  const token = header.slice('Bearer '.length)

  if (!token.startsWith(TOKEN_PREFIX)) {
    return null
  }

  const userId = Number(token.slice(TOKEN_PREFIX.length))

  const record = users.find((user) => user.id === userId)

  return record ? toPublicUser(record) : null
}

export function unauthorizedResponse() {
  return HttpResponse.json(
    {
      success: false,
      message: '請先登入',
    },
    { status: 401 },
  )
}

export function forbiddenResponse() {
  return HttpResponse.json(
    {
      success: false,
      message: '您沒有執行此操作的權限',
    },
    { status: 403 },
  )
}

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: Response }

/**
 * 模擬後端的 Authentication / Authorization。
 *
 * 回傳目前使用者，或 401 / 403 response。
 */
export function requireAuth(
  request: Request,
  permission?: Permission,
): AuthResult {
  const user = resolveUserFromRequest(request)

  if (!user) {
    return { ok: false, response: unauthorizedResponse() }
  }

  if (permission && !hasPermission(user.permissions, permission)) {
    return { ok: false, response: forbiddenResponse() }
  }

  return { ok: true, user }
}
