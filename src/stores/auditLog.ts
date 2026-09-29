import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getAuditLogs } from '../services/auditLogService'
import { getErrorMessage } from '../services/http'

import type { AuditLog, AuditLogQuery } from '../types/auditLog'
import type { PaginationMeta } from '../types/common'

const DEFAULT_QUERY: AuditLogQuery = {
  page: 1,
  pageSize: 20,
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const logs = ref<AuditLog[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<AuditLogQuery>({ ...DEFAULT_QUERY })

  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  async function fetchLogs() {
    loading.value = true
    error.value = null

    try {
      const response = await getAuditLogs(query.value)

      logs.value = response.data
      pagination.value = response.meta
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得稽核紀錄')
    } finally {
      loading.value = false
    }
  }

  function setQuery(newQuery: Partial<AuditLogQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function resetQuery() {
    query.value = { ...DEFAULT_QUERY }
  }

  return {
    logs,
    loading,
    error,
    query,
    pagination,
    fetchLogs,
    setQuery,
    resetQuery,
  }
})
