import { describe, expect, it } from 'vitest'

import {
  buildCalendarGrid,
  getMonthRange,
  shiftMonth,
  toDateKey,
} from './dates'

describe('dates', () => {
  it('toDateKey 以本地時區輸出 YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 9, 5))).toBe('2026-10-05')
  })

  it('getMonthRange 回傳該月第一天與最後一天', () => {
    expect(getMonthRange(2026, 2)).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    })
    expect(getMonthRange(2028, 2).to).toBe('2028-02-29')
  })

  it('buildCalendarGrid 以週日為起點並補齊前後月份', () => {
    // 2026-10-01 為星期四
    const weeks = buildCalendarGrid(2026, 10)

    expect(weeks).toHaveLength(5)
    expect(weeks[0].map((cell) => cell.key)).toEqual([
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ])
    expect(weeks[0][3].inMonth).toBe(false)
    expect(weeks[0][4].inMonth).toBe(true)
    expect(weeks[4][6].key).toBe('2026-10-31')
  })

  it('shiftMonth 跨年時正確換算', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })
})
