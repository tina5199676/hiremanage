import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from './auth'
import { useJobStore } from './job'

import type { CreateJobInput } from '../types/job'

const newJob: CreateJobInput = {
  title: 'Test Engineer',
  description: '測試用職缺',
  department: 'QA',
  location: 'Taipei',
  workType: 'remote',
  salaryMin: 50000,
  salaryMax: 70000,
  experience: '1+ years',
  education: 'Bachelor',
  requiredSkills: ['Playwright'],
  status: 'draft',
}

async function loginAs(username: string, password: string) {
  const authStore = useAuthStore()

  await authStore.login({ username, password })
}

describe('job store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('未登入時 fetchJobs 回傳 401 錯誤', async () => {
    const store = useJobStore()

    await store.fetchJobs()

    expect(store.jobs).toHaveLength(0)
    expect(store.error).toBe('請先登入')
  })

  it('fetchJobs 依 query 回傳分頁資料', async () => {
    await loginAs('hr', '<redacted>')

    const store = useJobStore()

    store.setQuery({ pageSize: 5, page: 1 })

    await store.fetchJobs()

    expect(store.error).toBeNull()
    expect(store.jobs).toHaveLength(5)
    expect(store.pagination.pageSize).toBe(5)
    expect(store.pagination.totalPages).toBeGreaterThan(1)
  })

  it('fetchJobs 可依狀態篩選', async () => {
    await loginAs('hr', '<redacted>')

    const store = useJobStore()

    store.setQuery({ status: 'open', pageSize: 100 })

    await store.fetchJobs()

    expect(store.jobs.length).toBeGreaterThan(0)
    expect(store.jobs.every((job) => job.status === 'open')).toBe(true)
  })

  it('fetchJobById 找不到時 selectedJob 為 null 且不視為錯誤', async () => {
    await loginAs('hr', '<redacted>')

    const store = useJobStore()

    await store.fetchJobById(9999)

    expect(store.selectedJob).toBeNull()
    expect(store.detailError).toBeNull()
  })

  it('createJob 後可再取得該職缺並刪除', async () => {
    await loginAs('hr', '<redacted>')

    const store = useJobStore()

    const created = await store.createJob(newJob)

    expect(created).not.toBeNull()
    expect(created?.title).toBe('Test Engineer')

    await store.fetchJobById(created!.id)

    expect(store.selectedJob?.id).toBe(created!.id)

    const deleted = await store.deleteJob(created!.id)

    expect(deleted).toBe(true)

    await store.fetchJobById(created!.id)

    expect(store.selectedJob).toBeNull()
  })

  it('沒有 job.create 權限時 createJob 回傳 403 訊息', async () => {
    await loginAs('manager', '<redacted>')

    const store = useJobStore()

    const created = await store.createJob(newJob)

    expect(created).toBeNull()
    expect(store.createError).toBe('您沒有執行此操作的權限')
  })
})
