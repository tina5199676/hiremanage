import { describe, expect, it } from 'vitest'

import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatSalaryRange,
} from './formatters'

describe('formatters', () => {
  it('formatDate 以 zh-TW 格式輸出年月日', () => {
    expect(formatDate('2026-09-01T09:00:00Z')).toMatch(/2026\/09\/01/)
  })

  it('formatDate 遇到無效日期回傳 -', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })

  it('formatCurrency 加上千分位與貨幣符號', () => {
    expect(formatCurrency(90000)).toBe('$90,000')
    expect(formatSalaryRange(60000, 90000)).toBe('$60,000 - $90,000')
  })

  it('formatRelativeTime 依時間差回傳描述', () => {
    const now = new Date('2026-09-29T10:00:00Z')

    expect(formatRelativeTime('2026-09-29T09:59:40Z', now)).toBe('剛剛')
    expect(formatRelativeTime('2026-09-29T09:30:00Z', now)).toBe('30 分鐘前')
    expect(formatRelativeTime('2026-09-29T07:00:00Z', now)).toBe('3 小時前')
    expect(formatRelativeTime('2026-09-27T10:00:00Z', now)).toBe('2 天前')
    expect(formatRelativeTime('2026-09-01T10:00:00Z', now)).toMatch(/2026\/09\/01/)
  })
})
