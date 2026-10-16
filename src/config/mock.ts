import type { Role } from '../types/auth'

/**
 * Mock 環境設定。
 *
 * 密碼不寫在程式碼中，而是由 .env（不進版控）透過 VITE_MOCK_*_PASSWORD 提供，
 * 範本見 .env.example。沒有設定密碼的帳號將無法登入。
 */

export const isMockEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK === 'true'

const MOCK_PASSWORDS: Record<Role, string | undefined> = {
  admin: import.meta.env.VITE_MOCK_ADMIN_PASSWORD,
  hr: import.meta.env.VITE_MOCK_HR_PASSWORD,
  manager: import.meta.env.VITE_MOCK_MANAGER_PASSWORD,
}

export function getMockPassword(role: Role): string | null {
  const password = MOCK_PASSWORDS[role]

  return password && password.trim().length > 0 ? password : null
}
