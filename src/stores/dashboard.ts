import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getDashboard } from '../services/dashboardService'
import { getErrorMessage } from '../services/http'

import type { DashboardData } from '../types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardData | null>(null)

  const loading = ref(false)

  const error = ref<string | null>(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null

    try {
      const response = await getDashboard()

      data.value = response.data
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得總覽資料')
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    fetchDashboard,
  }
})
