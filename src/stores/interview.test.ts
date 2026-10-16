import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { loginAs } from '../test/auth'

import { useInterviewStore } from './interview'

import type { CreateInterviewInput } from '../types/interview'

const newInterview: CreateInterviewInput = {
  applicationId: 3,
  interviewerId: 3,
  stage: 'technical',
  date: '2026-11-20',
  time: '14:00',
  durationMinutes: 60,
  mode: 'video',
  meetingLink: 'https://meet.example.com/test',
  location: '',
  notes: '',
  status: 'scheduled',
}

describe('interview store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('未登入時 fetchInterviews 回傳 401 錯誤', async () => {
    const store = useInterviewStore()

    await store.fetchInterviews()

    expect(store.interviews).toHaveLength(0)
    expect(store.error).toBe('請先登入')
  })

  it('fetchInterviews 可依日期區間取得該月份面試', async () => {
    await loginAs('hr')

    const store = useInterviewStore()

    store.setQuery({ from: '2026-10-01', to: '2026-10-31' })

    await store.fetchInterviews()

    expect(store.error).toBeNull()
    expect(store.interviews.length).toBeGreaterThan(0)
    expect(
      store.interviews.every((item) => item.date.startsWith('2026-10')),
    ).toBe(true)
  })

  it('fetchOptions 同時取得應徵紀錄與面試官選項', async () => {
    await loginAs('hr')

    const store = useInterviewStore()

    await store.fetchOptions()

    expect(store.optionsError).toBeNull()
    expect(store.applicationOptions.length).toBeGreaterThan(0)
    expect(store.interviewerOptions.map((user) => user.username)).toEqual([
      'admin',
      'hr',
      'manager',
    ])
  })

  it('createInterview 後可取得並刪除', async () => {
    await loginAs('hr')

    const store = useInterviewStore()

    const created = await store.createInterview(newInterview)

    expect(created).not.toBeNull()
    expect(created?.candidateName).not.toBe('')
    expect(created?.interviewerName).toBe('李冠廷')

    await store.fetchInterviewById(created!.id)

    expect(store.selectedInterview?.id).toBe(created!.id)

    const deleted = await store.deleteInterview(created!.id)

    expect(deleted).toBe(true)

    await store.fetchInterviewById(created!.id)

    expect(store.selectedInterview).toBeNull()
    expect(store.detailError).toBeNull()
  })

  it('面試官同時段已有面試時回傳 409 衝突訊息', async () => {
    await loginAs('hr')

    const store = useInterviewStore()

    // Mock Data 中 id 1 的面試：面試官 3，2026-10-01 14:00
    const created = await store.createInterview({
      ...newInterview,
      date: '2026-10-01',
      time: '14:00',
    })

    expect(created).toBeNull()
    expect(store.createError).toBe('該面試官在此時段已有其他面試')
  })

  it('非指派面試官送出回饋時回傳 403 訊息', async () => {
    await loginAs('manager')

    const store = useInterviewStore()

    // id 3 的面試由 hr（id 2）擔任面試官
    const result = await store.submitFeedback(3, {
      score: 4,
      feedback: '表現良好',
      notes: '',
    })

    expect(result).toBeNull()
    expect(store.feedbackError).toBe('只有指派的面試官可以填寫回饋')
  })

  it('指派的面試官送出回饋後面試狀態變為 completed', async () => {
    await loginAs('manager')

    const store = useInterviewStore()

    // id 9 的面試由 manager（id 3）擔任面試官
    const result = await store.submitFeedback(9, {
      score: 4,
      feedback: '技術深度足夠',
      notes: '可進入最終面試',
    })

    expect(result).not.toBeNull()
    expect(result?.status).toBe('completed')
    expect(result?.feedback?.score).toBe(4)
    expect(result?.feedback?.submittedByName).toBe('李冠廷')
    expect(store.selectedInterview?.id).toBe(9)
  })

  it('沒有 interview.create 權限時 createInterview 回傳 403 訊息', async () => {
    await loginAs('manager')

    const store = useInterviewStore()

    const created = await store.createInterview(newInterview)

    expect(created).toBeNull()
    expect(store.createError).toBe('您沒有執行此操作的權限')
  })
})
