import axios, { AxiosError } from 'axios'

import type { ApiErrorBody } from '../types/common'

export const TOKEN_STORAGE_KEY = 'hiremanage.token'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // localStorage 不可用時忽略（例如隱私模式）
  }
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/**
 * 由 app 啟動時註冊，避免 service 層直接依賴 store / router。
 */
export function onUnauthorized(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthEndpoint =
      error.config?.url?.startsWith('/auth/') ?? false

    if (error.response?.status === 401 && !isAuthEndpoint) {
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)

/**
 * 從 Axios 錯誤取出後端訊息，否則回傳 fallback。
 */
export function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (message) {
      return message
    }

    switch (status) {
      case 400:
        return '請求資料不正確'
      case 401:
        return '請先登入'
      case 403:
        return '您沒有執行此操作的權限'
      case 404:
        return '找不到指定資料'
      case 409:
        return '資料狀態衝突，請重新整理後再試'
      case 500:
        return '伺服器發生錯誤'
      default:
        return fallback
    }
  }

  return fallback
}

export function getErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null
  }

  return null
}
