/**
 * 行事曆相關的純函式，所有日期皆以 YYYY-MM-DD 字串表示，
 * 避免時區造成的日期位移。
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** 將 Date 轉為 YYYY-MM-DD（使用本地時區） */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** month 為 1 - 12 */
export function getMonthRange(
  year: number,
  month: number,
): { from: string; to: string } {
  const lastDay = new Date(year, month, 0).getDate()

  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  }
}

export interface CalendarDay {
  /** YYYY-MM-DD */
  key: string
  day: number
  /** 是否屬於目前顯示的月份（前後補齊的日期為 false） */
  inMonth: boolean
}

/**
 * 產生以週日為起點、每週 7 天的月曆格子（含前後月份補齊）。
 */
export function buildCalendarGrid(
  year: number,
  month: number,
): CalendarDay[][] {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const leading = firstDay.getDay()

  const cells: CalendarDay[] = []

  for (let offset = leading; offset > 0; offset -= 1) {
    const date = new Date(year, month - 1, 1 - offset)

    cells.push({ key: toDateKey(date), day: date.getDate(), inMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: toDateKey(new Date(year, month - 1, day)),
      day,
      inMonth: true,
    })
  }

  let trailing = 1

  while (cells.length % 7 !== 0) {
    const date = new Date(year, month, trailing)

    cells.push({ key: toDateKey(date), day: date.getDate(), inMonth: false })

    trailing += 1
  }

  const weeks: CalendarDay[][] = []

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }

  return weeks
}

/** 往前或往後移動 n 個月，回傳新的年與月 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1)

  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function formatMonthTitle(year: number, month: number): string {
  return `${year} 年 ${month} 月`
}
