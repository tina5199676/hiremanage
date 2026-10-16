import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { loginAs } from '../test/auth'

import { useCandidateStore } from './candidate'

import type { CreateCandidateInput } from '../types/candidate'

function buildCandidate(
  overrides: Partial<CreateCandidateInput> = {},
): CreateCandidateInput {
  return {
    name: '測試候選人',
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    phone: '0912-000-000',
    currentTitle: 'QA Engineer',
    currentCompany: 'Test Co.',
    location: 'Taipei',
    experience: '2 years',
    education: 'Bachelor',
    skills: ['Playwright'],
    source: 'referral',
    status: 'active',
    ...overrides,
  }
}

describe('candidate store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --------------------------------------------------
  // List / detail
  // --------------------------------------------------

  it('未登入時 fetchCandidates 回傳 401 錯誤', async () => {
    const store = useCandidateStore()

    await store.fetchCandidates()

    expect(store.candidates).toHaveLength(0)
    expect(store.error).toBe('請先登入')
  })

  it('fetchCandidates 依 query 回傳分頁資料', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    store.setQuery({ pageSize: 5, page: 1 })

    await store.fetchCandidates()

    expect(store.error).toBeNull()
    expect(store.candidates).toHaveLength(5)
    expect(store.pagination.pageSize).toBe(5)
    expect(store.pagination.totalPages).toBeGreaterThan(1)
  })

  it('fetchCandidates 可依狀態篩選與關鍵字搜尋', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    store.setQuery({ status: 'active', pageSize: 100 })

    await store.fetchCandidates()

    expect(store.candidates.length).toBeGreaterThan(0)
    expect(store.candidates.every((item) => item.status === 'active')).toBe(
      true,
    )

    store.resetQuery()
    store.setQuery({ search: 'boyu.chen' })

    await store.fetchCandidates()

    expect(store.candidates).toHaveLength(1)
    expect(store.candidates[0].email).toBe('boyu.chen@example.com')
  })

  it('fetchCandidateById 找不到時 selectedCandidate 為 null 且不視為錯誤', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    await store.fetchCandidateById(9999)

    expect(store.selectedCandidate).toBeNull()
    expect(store.detailError).toBeNull()
  })

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  it('createCandidate → updateCandidate → deleteCandidate 完整流程', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    const created = await store.createCandidate(buildCandidate())

    expect(created).not.toBeNull()
    expect(created?.name).toBe('測試候選人')

    await store.fetchCandidateById(created!.id)

    expect(store.selectedCandidate?.id).toBe(created!.id)

    const updated = await store.updateCandidate(created!.id, {
      ...buildCandidate({ email: created!.email }),
      name: '更新後的候選人',
      status: 'inactive',
    })

    expect(updated?.name).toBe('更新後的候選人')
    // 更新成功後 selectedCandidate 會同步
    expect(store.selectedCandidate?.name).toBe('更新後的候選人')
    expect(store.selectedCandidate?.status).toBe('inactive')

    const deleted = await store.deleteCandidate(created!.id)

    expect(deleted).toBe(true)

    await store.fetchCandidateById(created!.id)

    expect(store.selectedCandidate).toBeNull()
  })

  it('Email 重複時 createCandidate 回傳 409 訊息', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    const created = await store.createCandidate(
      buildCandidate({ email: 'boyu.chen@example.com' }),
    )

    expect(created).toBeNull()
    expect(store.createError).toBe('此 Email 已存在於候選人資料中')
  })

  it('沒有 candidate.create 權限時 createCandidate 回傳 403 訊息', async () => {
    await loginAs('manager')

    const store = useCandidateStore()

    const created = await store.createCandidate(buildCandidate())

    expect(created).toBeNull()
    expect(store.createError).toBe('您沒有執行此操作的權限')
  })

  // --------------------------------------------------
  // Notes
  // --------------------------------------------------

  it('fetchNotes 取得候選人備註，addNote 後新備註排在最前面', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    await store.fetchNotes(1)

    expect(store.notesError).toBeNull()

    const before = store.notes.length

    expect(before).toBeGreaterThan(0)

    const added = await store.addNote(1, '  單元測試新增的備註  ')

    expect(added).toBe(true)
    expect(store.notes).toHaveLength(before + 1)
    expect(store.notes[0].content).toBe('單元測試新增的備註')
    expect(store.notes[0].authorName).toBe('張雅婷')

    const removed = await store.removeNote(1, store.notes[0].id)

    expect(removed).toBe(true)
    expect(store.notes).toHaveLength(before)
  })

  it('空白備註回傳 400 訊息', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    const added = await store.addNote(1, '   ')

    expect(added).toBe(false)
    expect(store.notesError).toBe('請輸入備註內容')
  })

  it('刪除他人建立的備註回傳 403 訊息', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    await store.fetchNotes(1)

    // Mock Data 中 id 2 的備註由 manager（id 3）建立
    const removed = await store.removeNote(1, 2)

    expect(removed).toBe(false)
    expect(store.notesError).toBe('只能刪除自己建立的備註')
    expect(store.notes.some((note) => note.id === 2)).toBe(true)
  })

  it('沒有 candidate.note 權限時 addNote 回傳 403 訊息', async () => {
    await loginAs('manager')

    const store = useCandidateStore()

    const added = await store.addNote(1, '不該成功')

    expect(added).toBe(false)
    expect(store.notesError).toBe('您沒有執行此操作的權限')
  })

  // --------------------------------------------------
  // History
  // --------------------------------------------------

  it('fetchHistory 取得候選人的應徵、面試與 Offer 紀錄', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    await store.fetchHistory(1)

    expect(store.historyError).toBeNull()
    expect(store.history).not.toBeNull()
    expect(store.history!.applications.length).toBeGreaterThan(0)
    expect(
      store.history!.applications.every((item) => item.candidateId === 1),
    ).toBe(true)
    expect(store.history!.interviews.length).toBeGreaterThan(0)
    expect(
      store.history!.interviews.every((item) => item.candidateId === 1),
    ).toBe(true)
    expect(Array.isArray(store.history!.offers)).toBe(true)
  })

  it('fetchHistory 找不到候選人時回傳 404 訊息', async () => {
    await loginAs('hr')

    const store = useCandidateStore()

    await store.fetchHistory(9999)

    expect(store.history).toBeNull()
    expect(store.historyError).toBe('找不到指定候選人')
  })
})
