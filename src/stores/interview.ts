import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage, getErrorStatus } from '../services/http'
import {
  createInterview as createInterviewRequest,
  deleteInterview as deleteInterviewRequest,
  getApplicationOptions,
  getInterviewById,
  getInterviews,
  submitInterviewFeedback,
  updateInterview as updateInterviewRequest,
} from '../services/interviewService'
import { getUsers } from '../services/userService'

import type { Application } from '../types/application'
import type { User } from '../types/auth'
import type { PaginationMeta } from '../types/common'
import type {
  CreateInterviewInput,
  Interview,
  InterviewQuery,
  SubmitFeedbackInput,
  UpdateInterviewInput,
} from '../types/interview'

/** 行事曆一次取得整個月份的面試，因此預設 pageSize 較大 */
const DEFAULT_QUERY: InterviewQuery = {
  page: 1,
  pageSize: 100,
}

export const useInterviewStore = defineStore('interview', () => {
  // --------------------------------------------------
  // List state
  // --------------------------------------------------

  const interviews = ref<Interview[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<InterviewQuery>({ ...DEFAULT_QUERY })

  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 100,
    total: 0,
    totalPages: 0,
  })

  // --------------------------------------------------
  // Detail state
  // --------------------------------------------------

  const selectedInterview = ref<Interview | null>(null)

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

  const feedbackLoading = ref(false)
  const feedbackError = ref<string | null>(null)

  // --------------------------------------------------
  // Form options state
  // --------------------------------------------------

  const applicationOptions = ref<Application[]>([])

  const interviewerOptions = ref<User[]>([])

  const optionsLoading = ref(false)

  const optionsError = ref<string | null>(null)

  // --------------------------------------------------
  // Actions: list / detail
  // --------------------------------------------------

  async function fetchInterviews() {
    loading.value = true
    error.value = null

    try {
      const response = await getInterviews(query.value)

      interviews.value = response.data
      pagination.value = response.meta
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得面試資料')
    } finally {
      loading.value = false
    }
  }

  async function fetchInterviewById(id: number) {
    detailLoading.value = true
    detailError.value = null
    selectedInterview.value = null

    try {
      const response = await getInterviewById(id)

      selectedInterview.value = response.data
    } catch (err) {
      // 404 交由 View 顯示「找不到」，其他錯誤顯示錯誤訊息
      if (getErrorStatus(err) !== 404) {
        detailError.value = getErrorMessage(err, '無法取得面試詳細資料')
      }
    } finally {
      detailLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: mutations
  // --------------------------------------------------

  async function createInterview(
    payload: CreateInterviewInput,
  ): Promise<Interview | null> {
    createLoading.value = true
    createError.value = null

    try {
      const response = await createInterviewRequest(payload)

      return response.data
    } catch (err) {
      createError.value = getErrorMessage(err, '無法建立面試')

      return null
    } finally {
      createLoading.value = false
    }
  }

  async function updateInterview(
    id: number,
    payload: UpdateInterviewInput,
  ): Promise<Interview | null> {
    updateLoading.value = true
    updateError.value = null

    try {
      const response = await updateInterviewRequest(id, payload)

      if (response.data) {
        selectedInterview.value = response.data
      }

      return response.data
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新面試')

      return null
    } finally {
      updateLoading.value = false
    }
  }

  async function deleteInterview(id: number): Promise<boolean> {
    deleteLoading.value = true
    deleteError.value = null

    try {
      await deleteInterviewRequest(id)

      return true
    } catch (err) {
      deleteError.value = getErrorMessage(err, '無法刪除面試')

      return false
    } finally {
      deleteLoading.value = false
    }
  }

  async function submitFeedback(
    id: number,
    payload: SubmitFeedbackInput,
  ): Promise<Interview | null> {
    feedbackLoading.value = true
    feedbackError.value = null

    try {
      const response = await submitInterviewFeedback(id, payload)

      if (response.data) {
        selectedInterview.value = response.data
      }

      return response.data
    } catch (err) {
      feedbackError.value = getErrorMessage(err, '無法送出面試回饋')

      return null
    } finally {
      feedbackLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: form options
  // --------------------------------------------------

  async function fetchOptions() {
    optionsLoading.value = true
    optionsError.value = null

    try {
      const [applicationsResponse, usersResponse] = await Promise.all([
        getApplicationOptions(),
        getUsers(),
      ])

      applicationOptions.value = applicationsResponse.data
      interviewerOptions.value = usersResponse.data
    } catch (err) {
      optionsError.value = getErrorMessage(err, '無法取得表單選項')
    } finally {
      optionsLoading.value = false
    }
  }

  // --------------------------------------------------
  // Query
  // --------------------------------------------------

  function setQuery(newQuery: Partial<InterviewQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function resetQuery() {
    query.value = { ...DEFAULT_QUERY }
  }

  return {
    // List
    interviews,
    loading,
    error,
    query,
    pagination,
    fetchInterviews,

    // Detail
    selectedInterview,
    detailLoading,
    detailError,
    fetchInterviewById,

    // Mutations
    createLoading,
    createError,
    createInterview,
    updateLoading,
    updateError,
    updateInterview,
    deleteLoading,
    deleteError,
    deleteInterview,
    feedbackLoading,
    feedbackError,
    submitFeedback,

    // Options
    applicationOptions,
    interviewerOptions,
    optionsLoading,
    optionsError,
    fetchOptions,

    // Query
    setQuery,
    resetQuery,
  }
})
