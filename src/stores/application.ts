import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  createApplication as createApplicationRequest,
  deleteApplication as deleteApplicationRequest,
  getApplicationBoard,
  getApplicationById,
  getApplications,
  updateApplication as updateApplicationRequest,
  updateApplicationStatus,
} from '../services/applicationService'
import { getErrorMessage, getErrorStatus } from '../services/http'
import { APPLICATION_STATUS_ORDER } from '../utils/labels'

import type { UpdateApplicationInput } from '../services/applicationService'
import type {
  Application,
  ApplicationQuery,
  ApplicationStatus,
  CreateApplicationInput,
} from '../types/application'
import type { PaginationMeta } from '../types/common'

const DEFAULT_QUERY: ApplicationQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'appliedAt',
  sortOrder: 'desc',
}

function createEmptyBoard(): Record<ApplicationStatus, Application[]> {
  const board = {} as Record<ApplicationStatus, Application[]>

  APPLICATION_STATUS_ORDER.forEach((status) => {
    board[status] = []
  })

  return board
}

export const useApplicationStore = defineStore('application', () => {
  // --------------------------------------------------
  // List state
  // --------------------------------------------------

  const applications = ref<Application[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<ApplicationQuery>({ ...DEFAULT_QUERY })

  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  // --------------------------------------------------
  // Board state
  // --------------------------------------------------

  const board = ref<Record<ApplicationStatus, Application[]>>(
    createEmptyBoard(),
  )

  const boardLoading = ref(false)

  const boardError = ref<string | null>(null)

  // --------------------------------------------------
  // Detail state
  // --------------------------------------------------

  const selectedApplication = ref<Application | null>(null)

  const detailLoading = ref(false)

  const detailError = ref<string | null>(null)

  // --------------------------------------------------
  // Mutation state
  // --------------------------------------------------

  const createLoading = ref(false)
  const createError = ref<string | null>(null)

  const updateLoading = ref(false)
  const updateError = ref<string | null>(null)

  const deleteLoading = ref(false)
  const deleteError = ref<string | null>(null)

  const statusUpdatingId = ref<number | null>(null)

  // --------------------------------------------------
  // Actions: list / board / detail
  // --------------------------------------------------

  async function fetchApplications() {
    loading.value = true
    error.value = null

    try {
      const response = await getApplications(query.value)

      applications.value = response.data
      pagination.value = response.meta
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得應徵資料')
    } finally {
      loading.value = false
    }
  }

  async function fetchBoard() {
    boardLoading.value = true
    boardError.value = null

    try {
      const response = await getApplicationBoard()

      board.value = { ...createEmptyBoard(), ...response.data }
    } catch (err) {
      boardError.value = getErrorMessage(err, '無法取得應徵看板')
    } finally {
      boardLoading.value = false
    }
  }

  async function fetchApplicationById(id: number) {
    detailLoading.value = true
    detailError.value = null
    selectedApplication.value = null

    try {
      const response = await getApplicationById(id)

      selectedApplication.value = response.data
    } catch (err) {
      // 404 交由 View 顯示「找不到」，其他錯誤顯示錯誤訊息
      if (getErrorStatus(err) !== 404) {
        detailError.value = getErrorMessage(err, '無法取得應徵詳細資料')
      }
    } finally {
      detailLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: mutations
  // --------------------------------------------------

  async function createApplication(
    payload: CreateApplicationInput,
  ): Promise<Application | null> {
    createLoading.value = true
    createError.value = null

    try {
      const response = await createApplicationRequest(payload)

      return response.data
    } catch (err) {
      createError.value = getErrorMessage(err, '無法建立應徵紀錄')

      return null
    } finally {
      createLoading.value = false
    }
  }

  /**
   * 變更狀態。看板上先樂觀移動卡片，失敗時還原。
   */
  async function updateStatus(
    id: number,
    status: ApplicationStatus,
  ): Promise<Application | null> {
    statusUpdatingId.value = id
    updateError.value = null

    const previousStatus = APPLICATION_STATUS_ORDER.find((key) =>
      board.value[key].some((item) => item.id === id),
    )

    const previousCard = previousStatus
      ? board.value[previousStatus].find((item) => item.id === id)
      : undefined

    if (previousStatus && previousCard) {
      board.value[previousStatus] = board.value[previousStatus].filter(
        (item) => item.id !== id,
      )

      board.value[status] = [
        { ...previousCard, status },
        ...board.value[status],
      ]
    }

    try {
      const response = await updateApplicationStatus(id, { status })

      const updated = response.data

      if (updated) {
        board.value[status] = board.value[status].map((item) =>
          item.id === id ? updated : item,
        )

        applications.value = applications.value.map((item) =>
          item.id === id ? updated : item,
        )

        if (selectedApplication.value?.id === id) {
          selectedApplication.value = updated
        }
      }

      return updated
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新應徵狀態')

      if (previousStatus && previousCard) {
        board.value[status] = board.value[status].filter(
          (item) => item.id !== id,
        )

        board.value[previousStatus] = [
          previousCard,
          ...board.value[previousStatus],
        ]
      }

      return null
    } finally {
      statusUpdatingId.value = null
    }
  }

  async function updateApplication(
    id: number,
    payload: UpdateApplicationInput,
  ): Promise<Application | null> {
    updateLoading.value = true
    updateError.value = null

    try {
      const response = await updateApplicationRequest(id, payload)

      if (response.data) {
        selectedApplication.value = response.data
      }

      return response.data
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新應徵紀錄')

      return null
    } finally {
      updateLoading.value = false
    }
  }

  async function deleteApplication(id: number): Promise<boolean> {
    deleteLoading.value = true
    deleteError.value = null

    try {
      await deleteApplicationRequest(id)

      APPLICATION_STATUS_ORDER.forEach((status) => {
        board.value[status] = board.value[status].filter(
          (item) => item.id !== id,
        )
      })

      return true
    } catch (err) {
      deleteError.value = getErrorMessage(err, '無法刪除應徵紀錄')

      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // --------------------------------------------------
  // Query
  // --------------------------------------------------

  function setQuery(newQuery: Partial<ApplicationQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function resetQuery() {
    query.value = { ...DEFAULT_QUERY }
  }

  return {
    // List
    applications,
    loading,
    error,
    query,
    pagination,
    fetchApplications,

    // Board
    board,
    boardLoading,
    boardError,
    fetchBoard,

    // Detail
    selectedApplication,
    detailLoading,
    detailError,
    fetchApplicationById,

    // Mutations
    createLoading,
    createError,
    createApplication,
    updateLoading,
    updateError,
    updateApplication,
    statusUpdatingId,
    updateStatus,
    deleteLoading,
    deleteError,
    deleteApplication,

    // Query
    setQuery,
    resetQuery,
  }
})
