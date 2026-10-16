import type { Page } from '@playwright/test'

export async function login(
  page: Page,
  username = 'hr',
  password = '<redacted>',
) {
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
