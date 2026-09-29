import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../services/authService'
import {
  getErrorMessage,
  getStoredToken,
  setStoredToken,
} from '../services/http'
import {
  hasAnyPermission,
  hasPermission,
} from '../utils/permissions'

import type {
  LoginInput,
  Permission,
  User,
} from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const user = ref<User | null>(null)

  const token = ref<string | null>(getStoredToken())

  /** 是否已嘗試用既有 token 還原使用者 */
  const initialized = ref(false)

  const loading = ref(false)

  const error = ref<string | null>(null)

  // --------------------------------------------------
  // Getters
  // --------------------------------------------------

  const isAuthenticated = computed(() => {
    return user.value !== null
  })

  const permissions = computed(() => {
    return user.value?.permissions ?? []
  })

  function can(permission: Permission): boolean {
    return hasPermission(permissions.value, permission)
  }

  function canAny(list: readonly Permission[]): boolean {
    return hasAnyPermission(permissions.value, list)
  }

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------

  function clearSession() {
    user.value = null
    token.value = null
    setStoredToken(null)
  }

  async function login(payload: LoginInput): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await loginRequest(payload)

      token.value = response.data.token
      user.value = response.data.user
      setStoredToken(response.data.token)
      initialized.value = true

      return true
    } catch (err) {
      error.value = getErrorMessage(err, '登入失敗，請稍後再試')

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 使用 localStorage 的 token 還原登入狀態。
   * 只會執行一次；token 無效時清除 session。
   */
  async function initialize(): Promise<void> {
    if (initialized.value) {
      return
    }

    if (!token.value) {
      initialized.value = true

      return
    }

    loading.value = true

    try {
      const response = await getCurrentUser()

      user.value = response.data
    } catch {
      clearSession()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function logout(): Promise<void> {
    try {
      if (token.value) {
        await logoutRequest()
      }
    } catch {
      // 登出失敗仍清除本地 session
    } finally {
      clearSession()
    }
  }

  return {
    user,
    token,
    initialized,
    loading,
    error,
    isAuthenticated,
    permissions,
    can,
    canAny,
    login,
    initialize,
    logout,
    clearSession,
  }
})
