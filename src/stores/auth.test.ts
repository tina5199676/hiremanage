import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { TOKEN_STORAGE_KEY } from '../services/http'
import { useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('登入成功後儲存 token 與使用者', async () => {
    const store = useAuthStore()

    const success = await store.login({ username: 'hr', password: '<redacted>' })

    expect(success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.role).toBe('hr')
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('mock-token-2')
    expect(store.can('job.create')).toBe(true)
    expect(store.can('audit.read')).toBe(false)
  })

  it('帳號或密碼錯誤時回傳 401 訊息', async () => {
    const store = useAuthStore()

    const success = await store.login({ username: 'hr', password: 'wrong' })

    expect(success).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toBe('帳號或密碼錯誤')
  })

  it('initialize 使用既有 token 還原使用者', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-token-1')

    const store = useAuthStore()

    await store.initialize()

    expect(store.initialized).toBe(true)
    expect(store.user?.username).toBe('admin')
    expect(store.can('audit.read')).toBe(true)
  })

  it('initialize 遇到無效 token 時清除 session', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-token-999')

    const store = useAuthStore()

    await store.initialize()

    expect(store.user).toBeNull()
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('登出後清除使用者與 token', async () => {
    const store = useAuthStore()

    await store.login({ username: 'admin', password: '<redacted>' })
    await store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })
})
