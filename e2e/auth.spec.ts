import { expect, test } from '@playwright/test'

import { login, logout } from './helpers.ts'

test.describe('Authentication', () => {
  test('未登入時進入後台會導向登入頁並保留 redirect', async ({ page }) => {
    await page.goto('/admin/jobs')

    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)admin(%2F|\/)jobs$/)
    await expect(page.getByRole('button', { name: '登入' })).toBeVisible()
  })

  test('帳號或密碼錯誤時顯示錯誤訊息', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#login-username', 'hr')
    await page.fill('#login-password', 'wrong')
    await page.getByRole('button', { name: '登入' }).click()

    await expect(page.getByRole('alert')).toContainText('帳號或密碼錯誤')
    await expect(page).toHaveURL(/\/login/)
  })

  test('登入成功後進入總覽，登出後回到登入頁', async ({ page }) => {
    await login(page)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('總覽')

    await logout(page)

    await expect(page).toHaveURL(/\/login$/)
  })

  test('沒有權限的頁面會導向 403', async ({ page }) => {
    // Hiring Manager 沒有 audit.read
    await login(page, 'manager')

    await page.goto('/admin/audit-logs')

    await expect(page).toHaveURL(/\/403$/)
  })
})
