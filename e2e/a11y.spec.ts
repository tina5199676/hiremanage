import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { login } from './helpers.ts'

/**
 * 以 axe-core 掃描主要頁面，只檢查 WCAG 2.0 / 2.1 A 與 AA 規則。
 */
const PAGES = [
  { path: '/admin', name: '總覽' },
  { path: '/admin/jobs', name: '職缺管理' },
  { path: '/admin/jobs/create', name: '建立職缺' },
  { path: '/admin/jobs/1', name: '職缺詳細' },
  { path: '/admin/candidates', name: '候選人' },
  { path: '/admin/applications', name: '應徵管理' },
  { path: '/admin/interviews', name: '面試管理' },
  { path: '/admin/interviews/1', name: '面試詳細' },
  { path: '/admin/offers', name: 'Offer 管理' },
  { path: '/admin/offers/2', name: 'Offer 詳細' },
  { path: '/admin/notifications', name: '通知' },
]

async function scan(page: Parameters<typeof login>[0]) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')).slice(0, 3),
  }))
}

test.describe('Accessibility', () => {
  test('登入頁沒有 axe 違規', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: '登入' }).waitFor()

    expect(await scan(page)).toEqual([])
  })

  for (const target of PAGES) {
    test(`${target.name} 沒有 axe 違規`, async ({ page }) => {
      await login(page)
      await page.goto(target.path)
      await page.waitForLoadState('networkidle')
      await page.getByRole('heading', { level: 1 }).waitFor()

      expect(await scan(page)).toEqual([])
    })
  }
})
