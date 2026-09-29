import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  createJob as createJobRequest,
  deleteJob as deleteJobRequest,
  getJobById,
  getJobs,
  updateJob as updateJobRequest,
} from '../services/jobService'

import type {
  CreateJobInput,
  Job,
  JobQuery,
  PaginationMeta,
  UpdateJobInput,
} from '../types/job'

export const useJobStore = defineStore(
  'job',
  () => {
    // --------------------------------------------------
    // List state
    // --------------------------------------------------

    const jobs = ref<Job[]>([])

    const loading = ref(false)

    const error =
      ref<string | null>(null)

    const query = ref<JobQuery>({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    const pagination =
      ref<PaginationMeta>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      })

    // --------------------------------------------------
    // Detail state
    // --------------------------------------------------

    const selectedJob =
      ref<Job | null>(null)

    const detailLoading =
      ref(false)

    const detailError =
      ref<string | null>(null)

    // --------------------------------------------------
    // Create state
    // --------------------------------------------------

    const createLoading =
      ref(false)

    const createError =
      ref<string | null>(null)

    // --------------------------------------------------
    // Update state
    // --------------------------------------------------

    const updateLoading =
      ref(false)

    const updateError =
      ref<string | null>(null)

    // --------------------------------------------------
    // Delete state
    // --------------------------------------------------

    const deleteLoading =
      ref(false)

    const deleteError =
      ref<string | null>(null)

    // --------------------------------------------------
    // Fetch jobs
    // --------------------------------------------------

    async function fetchJobs() {
      loading.value = true
      error.value = null

      try {
        const response =
          await getJobs(query.value)

        jobs.value = response.data

        pagination.value =
          response.meta
      } catch (err) {
        console.error(err)

        error.value =
          '無法取得職缺資料'
      } finally {
        loading.value = false
      }
    }

    // --------------------------------------------------
    // Fetch single job
    // --------------------------------------------------

    async function fetchJobById(
      id: number,
    ) {
      detailLoading.value = true
      detailError.value = null
      selectedJob.value = null

      try {
        const response =
          await getJobById(id)

        selectedJob.value =
          response.data
      } catch (err) {
        console.error(err)

        detailError.value =
          '無法取得職缺詳細資料'
      } finally {
        detailLoading.value = false
      }
    }

    // --------------------------------------------------
    // Create job
    // --------------------------------------------------

    async function createJob(
      payload: CreateJobInput,
    ): Promise<Job | null> {
      createLoading.value = true
      createError.value = null

      try {
        const response =
          await createJobRequest(payload)

        return response.data
      } catch (err) {
        console.error(err)

        createError.value =
          '無法建立職缺'

        return null
      } finally {
        createLoading.value = false
      }
    }

    // --------------------------------------------------
    // Update job
    // --------------------------------------------------

    async function updateJob(
      id: number,
      payload: UpdateJobInput,
    ): Promise<Job | null> {
      updateLoading.value = true
      updateError.value = null

      try {
        const response =
          await updateJobRequest(
            id,
            payload,
          )

        return response.data
      } catch (err) {
        console.error(err)

        updateError.value =
          '無法更新職缺'

        return null
      } finally {
        updateLoading.value = false
      }
    }

    // --------------------------------------------------
    // Delete job
    // --------------------------------------------------

    async function deleteJob(
      id: number,
    ): Promise<boolean> {
      deleteLoading.value = true
      deleteError.value = null

      try {
        await deleteJobRequest(id)

        return true
      } catch (err) {
        console.error(err)

        deleteError.value =
          '無法刪除職缺'

        return false
      } finally {
        deleteLoading.value = false
      }
    }

    // --------------------------------------------------
    // Query
    // --------------------------------------------------

    function setQuery(
      newQuery: Partial<JobQuery>,
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
      jobs,
      loading,
      error,
      query,
      pagination,
      fetchJobs,

      // Detail
      selectedJob,
      detailLoading,
      detailError,
      fetchJobById,

      // Create
      createLoading,
      createError,
      createJob,

      // Update
      updateLoading,
      updateError,
      updateJob,

      // Delete
      deleteLoading,
      deleteError,
      deleteJob,

      // Query
      setQuery,
      resetQuery,
    }
  },
)