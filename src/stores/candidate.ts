import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  getCandidateById,
  getCandidates,
} from '../services/candidateService'

import type {
  Candidate,
  CandidatePaginationMeta,
  CandidateQuery,
} from '../types/candidate'

export const useCandidateStore = defineStore(
  'candidate',
  () => {
    // --------------------------------------------------
    // List state
    // --------------------------------------------------

    const candidates =
      ref<Candidate[]>([])

    const loading = ref(false)

    const error =
      ref<string | null>(null)

    const query = ref<CandidateQuery>({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    const pagination =
      ref<CandidatePaginationMeta>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      })

    // --------------------------------------------------
    // Detail state
    // --------------------------------------------------

    const selectedCandidate =
      ref<Candidate | null>(null)

    const detailLoading =
      ref(false)

    const detailError =
      ref<string | null>(null)

    // --------------------------------------------------
    // Fetch candidates
    // --------------------------------------------------

    async function fetchCandidates() {
      loading.value = true
      error.value = null

      try {
        const response =
          await getCandidates(query.value)

        candidates.value = response.data

        pagination.value =
          response.meta
      } catch (err) {
        console.error(err)

        error.value =
          '無法取得候選人資料'
      } finally {
        loading.value = false
      }
    }

    // --------------------------------------------------
    // Fetch single candidate
    // --------------------------------------------------

    async function fetchCandidateById(
      id: number,
    ) {
      detailLoading.value = true
      detailError.value = null
      selectedCandidate.value = null

      try {
        const response =
          await getCandidateById(id)

        selectedCandidate.value =
          response.data
      } catch (err) {
        console.error(err)

        detailError.value =
          '無法取得候選人詳細資料'
      } finally {
        detailLoading.value = false
      }
    }

    // --------------------------------------------------
    // Query
    // --------------------------------------------------

    function setQuery(
      newQuery: Partial<CandidateQuery>,
    ) {
      query.value = {
        ...query.value,
        ...newQuery,
      }
    }

    function resetQuery() {
      query.value = {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
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

      // Query
      setQuery,
      resetQuery,
    }
  },
)
