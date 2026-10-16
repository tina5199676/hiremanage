import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from './auth'
import { useApplicationStore } from './application'
import { APPLICATION_STATUS_ORDER } from '../utils/labels'

import type { CreateApplicationInput } from '../types/application'

/** 候選人 3 尚未應徵過職缺 1 */
const newApplication: CreateApplicationInput = {
  candidateId: 3,
  jobId: 1,
  status: 'applied',
  note: '單元測試建立',
}

async function loginAs(username: string, password: string) {
  const authStore = useAuthStore()

  await authStore.login({ username, password })
}

describe('application store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --------------------------------------------------
  // List / board / detail
  // --------------------------------------------------

  it('未登入時 fetchApplications 回傳 401 錯誤', async () => {
    const store = useApplicationStore()

    await store.fetchApplications()

    expect(store.applications).toHaveLength(0)
    expect(store.error).toBe('請先登入')
  })

  it('fetchApplications 依 query 回傳分頁資料並可依狀態篩選', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    store.setQuery({ pageSize: 5, page: 1 })

    await store.fetchApplications()

    expect(store.error).toBeNull()
    expect(store.applications).toHaveLength(5)
    expect(store.pagination.totalPages).toBeGreaterThan(1)

    store.setQuery({ status: 'applied', pageSize: 100 })

    await store.fetchApplications()

    expect(store.applications.length).toBeGreaterThan(0)
    expect(
      store.applications.every((item) => item.status === 'applied'),
    ).toBe(true)
  })

  it('fetchBoard 依狀態分組，且每欄的卡片狀態正確', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    await store.fetchBoard()

    expect(store.boardError).toBeNull()
    expect(Object.keys(store.board)).toEqual(APPLICATION_STATUS_ORDER)

    let total = 0

    APPLICATION_STATUS_ORDER.forEach((status) => {
      total += store.board[status].length

      expect(
        store.board[status].every((item) => item.status === status),
      ).toBe(true)
    })

    expect(total).toBeGreaterThan(0)
  })

  it('fetchApplicationById 找不到時 selectedApplication 為 null 且不視為錯誤', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    await store.fetchApplicationById(9999)

    expect(store.selectedApplication).toBeNull()
    expect(store.detailError).toBeNull()
  })

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  it('createApplication → updateApplication → deleteApplication 完整流程', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    const created = await store.createApplication(newApplication)

    expect(created).not.toBeNull()
    expect(created?.status).toBe('applied')
    // Mock API 會解析候選人與職缺名稱
    expect(created?.candidateName).not.toBe('')
    expect(created?.jobTitle).not.toBe('')

    // 同一候選人重複應徵同一職缺 → 409
    const duplicated = await store.createApplication(newApplication)

    expect(duplicated).toBeNull()
    expect(store.createError).toBe('此候選人已應徵過此職缺')

    await store.fetchApplicationById(created!.id)

    const updated = await store.updateApplication(created!.id, {
      status: 'applied',
      note: '更新後的備註',
    })

    expect(updated?.note).toBe('更新後的備註')
    expect(store.selectedApplication?.note).toBe('更新後的備註')

    const deleted = await store.deleteApplication(created!.id)

    expect(deleted).toBe(true)

    await store.fetchApplicationById(created!.id)

    expect(store.selectedApplication).toBeNull()
  })

  it('updateStatus 會樂觀移動看板卡片，成功後同步 selectedApplication', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    const created = await store.createApplication(newApplication)

    await store.fetchBoard()
    await store.fetchApplicationById(created!.id)

    expect(store.board.applied.some((item) => item.id === created!.id)).toBe(
      true,
    )

    const updated = await store.updateStatus(created!.id, 'screening')

    expect(updated?.status).toBe('screening')
    expect(store.updateError).toBeNull()
    expect(store.statusUpdatingId).toBeNull()
    expect(store.board.applied.some((item) => item.id === created!.id)).toBe(
      false,
    )
    expect(
      store.board.screening.some((item) => item.id === created!.id),
    ).toBe(true)
    expect(store.selectedApplication?.status).toBe('screening')

    await store.deleteApplication(created!.id)
  })

  it('updateStatus 失敗時還原看板卡片位置', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    const created = await store.createApplication(newApplication)

    await store.fetchBoard()

    // 狀態未變更 → Mock API 回傳 409
    const result = await store.updateStatus(created!.id, 'applied')

    expect(result).toBeNull()
    expect(store.updateError).toBe('應徵狀態未變更')
    expect(store.board.applied.some((item) => item.id === created!.id)).toBe(
      true,
    )

    await store.deleteApplication(created!.id)
  })

  it('deleteApplication 會從看板移除卡片', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    const created = await store.createApplication(newApplication)

    await store.fetchBoard()

    const deleted = await store.deleteApplication(created!.id)

    expect(deleted).toBe(true)
    expect(
      APPLICATION_STATUS_ORDER.every(
        (status) => !store.board[status].some((item) => item.id === created!.id),
      ),
    ).toBe(true)
  })

  it('找不到應徵紀錄時 updateStatus 回傳 404 訊息', async () => {
    await loginAs('hr', '<redacted>')

    const store = useApplicationStore()

    const result = await store.updateStatus(9999, 'screening')

    expect(result).toBeNull()
    expect(store.updateError).toBe('找不到指定應徵紀錄')
  })

  it('沒有 application.create 權限時 createApplication 回傳 403 訊息', async () => {
    await loginAs('manager', '<redacted>')

    const store = useApplicationStore()

    const created = await store.createApplication(newApplication)

    expect(created).toBeNull()
    expect(store.createError).toBe('您沒有執行此操作的權限')
  })
})
