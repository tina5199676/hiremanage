const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const numberFormatter = new Intl.NumberFormat('zh-TW')

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | Date): string {
  const date = toDate(value)

  return date ? dateFormatter.format(date) : '-'
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value)

  return date ? dateTimeFormatter.format(date) : '-'
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatCurrency(value: number): string {
  return `$${numberFormatter.format(value)}`
}

export function formatSalaryRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

/**
 * Returns a relative description such as "3 天前" for recent timestamps.
 * Falls back to an absolute date for anything older than a week.
 */
export function formatRelativeTime(
  value: string | Date,
  now: Date = new Date(),
): string {
  const date = toDate(value)

  if (!date) {
    return '-'
  }

  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) {
    return '剛剛'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} 小時前`
  }

  const diffDays = Math.round(diffHours / 24)

  if (diffDays < 7) {
    return `${diffDays} 天前`
  }

  return formatDate(date)
}
