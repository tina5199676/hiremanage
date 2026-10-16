import type { Page } from '@playwright/test'

const PASSWORD_ENV: Record<string, string> = {
  admin: 'VITE_MOCK_ADMIN_PASSWORD',
  hr: 'VITE_MOCK_HR_PASSWORD',
  manager: 'VITE_MOCK_MANAGER_PASSWORD',
}

/** 密碼由 .env 提供（playwright.config.ts 會載入），不寫死在測試中 */
export function mockPassword(username: string): string {
  const password = process.env[PASSWORD_ENV[username] ?? '']

  if (!password) {
    throw new Error(
      `Mock 帳號 ${username} 沒有設定密碼，請確認 .env（參考 .env.example）`,
    )
  }

  return password
}

export async function login(page: Page, username = 'hr') {
  const password = mockPassword(username)

  await page.goto('/login')
  await page.fill('#login-username', username)
  await page.fill('#login-password', password)
  await page.getByRole('button', { name: '登入' }).click()
  await page.waitForURL('**/admin')
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: '登出' }).click()
  await page.waitForURL('**/login')
}
