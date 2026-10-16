import { expect, test } from '@playwright/test'

import { login, logout } from './helpers.ts'

test.describe('Job management flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Login → Job List → Create Job → Job Detail', async ({ page }) => {
    const title = `E2E Engineer ${Date.now()}`

    // Job List
    await page.getByRole('link', { name: '職缺管理' }).click()
    await expect(page).toHaveURL(/\/admin\/jobs$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('職缺管理')
    await expect(page.locator('tbody tr')).not.toHaveCount(0)

    // Create Job
    await page.getByRole('link', { name: '建立職缺' }).click()
    await expect(page).toHaveURL(/\/admin\/jobs\/create$/)

    // 空表單送出 → 顯示驗證錯誤
    await page.getByRole('button', { name: '建立職缺' }).click()
    await expect(page.getByText('請輸入職缺名稱')).toBeVisible()

    await page.fill('#job-title', title)
    await page.fill('#job-description', '由 Playwright 建立的測試職缺')
    await page.fill('#job-department', 'QA')
    await page.fill('#job-location', 'Taipei')
    await page.selectOption('#job-work-type', 'remote')
    await page.selectOption('#job-status', 'open')
    await page.fill('#job-salary-min', '60000')
    await page.fill('#job-salary-max', '80000')
    await page.fill('#job-experience', '2+ years')
    await page.fill('#job-education', 'Bachelor')
    await page.fill('#job-required-skills', 'Playwright, TypeScript')
    await page.getByRole('button', { name: '建立職缺' }).click()

    // Job Detail
    await expect(page).toHaveURL(/\/admin\/jobs\/\d+$/)
    await expect(page.locator('#job-overview-title')).toHaveText(title)
    await expect(page.getByText('開放中').first()).toBeVisible()
    await expect(page.getByText('Playwright', { exact: true })).toBeVisible()

    // 回到列表可搜尋到新職缺
    await page.getByRole('link', { name: '返回職缺列表' }).click()
    await page.fill('#job-search', title)
    await page.getByRole('button', { name: '搜尋' }).click()
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr').first()).toContainText(title)
  })

  test('刪除職缺需要確認，確認後回到列表', async ({ page }) => {
    const title = `Delete Me ${Date.now()}`

    await page.goto('/admin/jobs/create')
    await page.fill('#job-title', title)
    await page.fill('#job-description', '待刪除')
    await page.fill('#job-department', 'QA')
    await page.fill('#job-location', 'Taipei')
    await page.selectOption('#job-work-type', 'onsite')
    await page.selectOption('#job-status', 'draft')
    await page.fill('#job-salary-min', '50000')
    await page.fill('#job-salary-max', '60000')
    await page.fill('#job-experience', '1+ years')
    await page.fill('#job-education', 'Bachelor')
    await page.fill('#job-required-skills', 'Testing')
    await page.getByRole('button', { name: '建立職缺' }).click()
    await expect(page).toHaveURL(/\/admin\/jobs\/\d+$/)

    await page.getByRole('button', { name: '刪除職缺' }).click()

    const dialog = page.getByRole('dialog')

    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(title)

    // 取消不會刪除
    await dialog.getByRole('button', { name: '取消' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('#job-overview-title')).toHaveText(title)

    // 確認刪除
    await page.getByRole('button', { name: '刪除職缺' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '刪除' }).click()

    await expect(page).toHaveURL(/\/admin\/jobs$/)
  })

  test('Hiring Manager 看不到建立職缺按鈕', async ({ page }) => {
    await logout(page)
    await login(page, 'manager')

    await page.goto('/admin/jobs')

    await expect(page.getByRole('link', { name: '建立職缺' })).toHaveCount(0)
  })
})
