import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  createCandidate as createCandidateRequest,
  createCandidateNote,
  deleteCandidate as deleteCandidateRequest,
  deleteCandidateNote,
  getCandidateById,
  getCandidateHistory,
  getCandidateNotes,
  getCandidates,
  updateCandidate as updateCandidateRequest,
} from '../services/candidateService'
import { getErrorMessage, getErrorStatus } from '../services/http'

import type {
  Candidate,
  CandidateHistory,
  CandidateNote,
  CandidatePaginationMeta,
  CandidateQuery,
  CreateCandidateInput,
  UpdateCandidateInput,
} from '../types/candidate'

const DEFAULT_QUERY: CandidateQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const useCandidateStore = defineStore('candidate', () => {
  // --------------------------------------------------
  // List state
  // --------------------------------------------------

  const candidates = ref<Candidate[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<CandidateQuery>({ ...DEFAULT_QUERY })

  const pagination = ref<CandidatePaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  // --------------------------------------------------
  // Detail state
  // --------------------------------------------------

  const selectedCandidate = ref<Candidate | null>(null)

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

  // --------------------------------------------------
  // Notes state
  // --------------------------------------------------

  const notes = ref<CandidateNote[]>([])
  const notesLoading = ref(false)
  const notesError = ref<string | null>(null)
  const noteSubmitting = ref(false)

  // --------------------------------------------------
  // History state
  // --------------------------------------------------

  const history = ref<CandidateHistory | null>(null)
  const historyLoading = ref(false)
  const historyError = ref<string | null>(null)

  // --------------------------------------------------
  // Actions: list / detail
  // --------------------------------------------------

  async function fetchCandidates() {
    loading.value = true
    error.value = null

    try {
      const response = await getCandidates(query.value)

      candidates.value = response.data
      pagination.value = response.meta
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得候選人資料')
    } finally {
      loading.value = false
    }
  }

  async function fetchCandidateById(id: number) {
    detailLoading.value = true
    detailError.value = null
    selectedCandidate.value = null

    try {
      const response = await getCandidateById(id)

      selectedCandidate.value = response.data
    } catch (err) {
      // 404 交由 View 顯示「找不到」，其他錯誤顯示錯誤訊息
      if (getErrorStatus(err) !== 404) {
        detailError.value = getErrorMessage(err, '無法取得候選人詳細資料')
      }
    } finally {
      detailLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: mutations
  // --------------------------------------------------

  async function createCandidate(
    payload: CreateCandidateInput,
  ): Promise<Candidate | null> {
    createLoading.value = true
    createError.value = null

    try {
      const response = await createCandidateRequest(payload)

      return response.data
    } catch (err) {
      createError.value = getErrorMessage(err, '無法建立候選人')

      return null
    } finally {
      createLoading.value = false
    }
  }

  async function updateCandidate(
    id: number,
    payload: UpdateCandidateInput,
  ): Promise<Candidate | null> {
    updateLoading.value = true
    updateError.value = null

    try {
      const response = await updateCandidateRequest(id, payload)

      if (response.data) {
        selectedCandidate.value = response.data
      }

      return response.data
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新候選人')

      return null
    } finally {
      updateLoading.value = false
    }
  }

  async function deleteCandidate(id: number): Promise<boolean> {
    deleteLoading.value = true
    deleteError.value = null

    try {
      await deleteCandidateRequest(id)

      return true
    } catch (err) {
      deleteError.value = getErrorMessage(err, '無法刪除候選人')

      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: notes
  // --------------------------------------------------

  async function fetchNotes(candidateId: number) {
    notesLoading.value = true
    notesError.value = null

    try {
      const response = await getCandidateNotes(candidateId)

      notes.value = response.data
    } catch (err) {
      notesError.value = getErrorMessage(err, '無法取得備註')
    } finally {
      notesLoading.value = false
    }
  }

  async function addNote(
    candidateId: number,
    content: string,
  ): Promise<boolean> {
    noteSubmitting.value = true
    notesError.value = null

    try {
      const response = await createCandidateNote(candidateId, { content })

      notes.value = [response.data, ...notes.value]

      return true
    } catch (err) {
      notesError.value = getErrorMessage(err, '無法新增備註')

      return false
    } finally {
      noteSubmitting.value = false
    }
  }

  async function removeNote(
    candidateId: number,
    noteId: number,
  ): Promise<boolean> {
    notesError.value = null

    try {
      await deleteCandidateNote(candidateId, noteId)

      notes.value = notes.value.filter((note) => note.id !== noteId)

      return true
    } catch (err) {
      notesError.value = getErrorMessage(err, '無法刪除備註')

      return false
    }
  }

  // --------------------------------------------------
  // Actions: history
  // --------------------------------------------------

  async function fetchHistory(candidateId: number) {
    historyLoading.value = true
    historyError.value = null
    history.value = null

    try {
      const response = await getCandidateHistory(candidateId)

      history.value = response.data
    } catch (err) {
      historyError.value = getErrorMessage(err, '無法取得候選人紀錄')
    } finally {
      historyLoading.value = false
    }
  }

  // --------------------------------------------------
  // Query
  // --------------------------------------------------

  function setQuery(newQuery: Partial<CandidateQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function resetQuery() {
    query.value = { ...DEFAULT_QUERY }
  }

  return {
    // List
    candidates,
    loading,
    error,
    query,
    pagination,
    fetchCandidates,

    // Detail
    selectedCandidate,
    detailLoading,
    detailError,
    fetchCandidateById,

    // Mutations
    createLoading,
    createError,
    createCandidate,
    updateLoading,
    updateError,
    updateCandidate,
    deleteLoading,
    deleteError,
    deleteCandidate,

    // Notes
    notes,
    notesLoading,
    notesError,
    noteSubmitting,
    fetchNotes,
    addNote,
    removeNote,

    // History
    history,
    historyLoading,
    historyError,
    fetchHistory,

    // Query
    setQuery,
    resetQuery,
  }
})
