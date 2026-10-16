import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getErrorMessage, getErrorStatus } from './http'

function axiosError(status: number, message?: string) {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    { headers: new AxiosHeaders() },
    null,
    {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: message ? { success: false, message } : {},
    },
  )
}

describe('getErrorMessage', () => {
  it('優先使用後端回傳的 message', () => {
    expect(getErrorMessage(axiosError(409, '資料衝突'), 'fallback')).toBe(
      '資料衝突',
    )
  })

  it('依 HTTP status 對應預設訊息', () => {
    expect(getErrorMessage(axiosError(401), 'fallback')).toBe('請先登入')
    expect(getErrorMessage(axiosError(403), 'fallback')).toBe(
      '您沒有執行此操作的權限',
    )
    expect(getErrorMessage(axiosError(404), 'fallback')).toBe('找不到指定資料')
    expect(getErrorMessage(axiosError(500), 'fallback')).toBe('伺服器發生錯誤')
  })

  it('非 Axios 錯誤時回傳 fallback', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
  })
})

describe('getErrorStatus', () => {
  it('回傳 Axios 錯誤的 status，其他為 null', () => {
    expect(getErrorStatus(axiosError(404))).toBe(404)
    expect(getErrorStatus(new Error('boom'))).toBeNull()
  })
})
