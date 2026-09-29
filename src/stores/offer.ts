import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getErrorMessage, getErrorStatus } from '../services/http'
import {
  createOffer as createOfferRequest,
  deleteOffer as deleteOfferRequest,
  getOfferById,
  getOffers,
  updateOffer as updateOfferRequest,
  updateOfferStatus,
} from '../services/offerService'

import type { PaginationMeta } from '../types/common'
import type {
  CreateOfferInput,
  Offer,
  OfferQuery,
  OfferStatus,
  UpdateOfferInput,
} from '../types/offer'

const DEFAULT_QUERY: OfferQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const useOfferStore = defineStore('offer', () => {
  // --------------------------------------------------
  // List state
  // --------------------------------------------------

  const offers = ref<Offer[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const query = ref<OfferQuery>({ ...DEFAULT_QUERY })

  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  // --------------------------------------------------
  // Detail state
  // --------------------------------------------------

  const selectedOffer = ref<Offer | null>(null)

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

  const statusUpdating = ref(false)

  // --------------------------------------------------
  // Actions: list / detail
  // --------------------------------------------------

  async function fetchOffers() {
    loading.value = true
    error.value = null

    try {
      const response = await getOffers(query.value)

      offers.value = response.data
      pagination.value = response.meta
    } catch (err) {
      error.value = getErrorMessage(err, '無法取得 Offer 資料')
    } finally {
      loading.value = false
    }
  }

  async function fetchOfferById(id: number) {
    detailLoading.value = true
    detailError.value = null
    selectedOffer.value = null

    try {
      const response = await getOfferById(id)

      selectedOffer.value = response.data
    } catch (err) {
      // 404 交由 View 顯示「找不到」，其他錯誤顯示錯誤訊息
      if (getErrorStatus(err) !== 404) {
        detailError.value = getErrorMessage(err, '無法取得 Offer 詳細資料')
      }
    } finally {
      detailLoading.value = false
    }
  }

  // --------------------------------------------------
  // Actions: mutations
  // --------------------------------------------------

  async function createOffer(
    payload: CreateOfferInput,
  ): Promise<Offer | null> {
    createLoading.value = true
    createError.value = null

    try {
      const response = await createOfferRequest(payload)

      return response.data
    } catch (err) {
      createError.value = getErrorMessage(err, '無法建立 Offer')

      return null
    } finally {
      createLoading.value = false
    }
  }

  async function updateOffer(
    id: number,
    payload: UpdateOfferInput,
  ): Promise<Offer | null> {
    updateLoading.value = true
    updateError.value = null

    try {
      const response = await updateOfferRequest(id, payload)

      if (response.data) {
        selectedOffer.value = response.data
      }

      return response.data
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新 Offer')

      return null
    } finally {
      updateLoading.value = false
    }
  }

  async function updateStatus(
    id: number,
    status: OfferStatus,
  ): Promise<Offer | null> {
    statusUpdating.value = true
    updateError.value = null

    try {
      const response = await updateOfferStatus(id, status)

      if (response.data) {
        selectedOffer.value = response.data

        const index = offers.value.findIndex((item) => item.id === id)

        if (index !== -1) {
          offers.value[index] = response.data
        }
      }

      return response.data
    } catch (err) {
      updateError.value = getErrorMessage(err, '無法更新 Offer 狀態')

      return null
    } finally {
      statusUpdating.value = false
    }
  }

  async function deleteOffer(id: number): Promise<boolean> {
    deleteLoading.value = true
    deleteError.value = null

    try {
      await deleteOfferRequest(id)

      return true
    } catch (err) {
      deleteError.value = getErrorMessage(err, '無法刪除 Offer')

      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // --------------------------------------------------
  // Query
  // --------------------------------------------------

  function setQuery(newQuery: Partial<OfferQuery>) {
    query.value = { ...query.value, ...newQuery }
  }

  function resetQuery() {
    query.value = { ...DEFAULT_QUERY }
  }

  return {
    // List
    offers,
    loading,
    error,
    query,
    pagination,
    fetchOffers,

    // Detail
    selectedOffer,
    detailLoading,
    detailError,
    fetchOfferById,

    // Mutations
    createLoading,
    createError,
    createOffer,
    updateLoading,
    updateError,
    updateOffer,
    statusUpdating,
    updateStatus,
    deleteLoading,
    deleteError,
    deleteOffer,

    // Query
    setQuery,
    resetQuery,
  }
})
