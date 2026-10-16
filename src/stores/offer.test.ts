import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { loginAs } from '../test/auth'

import { useOfferStore } from './offer'

import type { CreateOfferInput } from '../types/offer'

const newOffer: CreateOfferInput = {
  // 應徵紀錄 3 目前沒有 Offer
  applicationId: 3,
  salary: 70000,
  startDate: '2026-12-01',
  expirationDate: '2026-11-15',
  benefits: ['勞健保', '年終獎金'],
  message: '測試用 Offer',
  status: 'draft',
}

describe('offer store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('未登入時 fetchOffers 回傳 401 錯誤', async () => {
    const store = useOfferStore()

    await store.fetchOffers()

    expect(store.offers).toHaveLength(0)
    expect(store.error).toBe('請先登入')
  })

  it('fetchOffers 可依狀態篩選', async () => {
    await loginAs('hr')

    const store = useOfferStore()

    store.setQuery({ status: 'draft' })

    await store.fetchOffers()

    expect(store.error).toBeNull()
    expect(store.offers.length).toBeGreaterThan(0)
    expect(store.offers.every((offer) => offer.status === 'draft')).toBe(true)
  })

  it('fetchApplicationOptions 取得應徵紀錄選項', async () => {
    await loginAs('hr')

    const store = useOfferStore()

    await store.fetchApplicationOptions()

    expect(store.optionsError).toBeNull()
    expect(store.applicationOptions.length).toBeGreaterThan(0)
  })

  it('createOffer 後依狀態流轉 draft → sent → rejected，最後可刪除', async () => {
    await loginAs('hr')

    const store = useOfferStore()

    const created = await store.createOffer(newOffer)

    expect(created).not.toBeNull()
    expect(created?.status).toBe('draft')

    // draft 不能直接 accepted
    const invalid = await store.updateStatus(created!.id, 'accepted')

    expect(invalid).toBeNull()
    expect(store.updateError).toBe('無法由 draft 變更為 accepted')

    const sent = await store.updateStatus(created!.id, 'sent')

    expect(sent?.status).toBe('sent')
    expect(store.selectedOffer?.status).toBe('sent')

    const rejected = await store.updateStatus(created!.id, 'rejected')

    expect(rejected?.status).toBe('rejected')

    const deleted = await store.deleteOffer(created!.id)

    expect(deleted).toBe(true)

    await store.fetchOfferById(created!.id)

    expect(store.selectedOffer).toBeNull()
    expect(store.detailError).toBeNull()
  })

  it('同一應徵紀錄已有進行中的 Offer 時回傳 409 訊息', async () => {
    await loginAs('hr')

    const store = useOfferStore()

    // 應徵紀錄 5 已有 status = sent 的 Offer
    const created = await store.createOffer({ ...newOffer, applicationId: 5 })

    expect(created).toBeNull()
    expect(store.createError).toBe('此應徵紀錄已有進行中的 Offer')
  })

  it('沒有 offer.create 權限時 createOffer 回傳 403 訊息', async () => {
    await loginAs('manager')

    const store = useOfferStore()

    const created = await store.createOffer(newOffer)

    expect(created).toBeNull()
    expect(store.createError).toBe('您沒有執行此操作的權限')
  })
})
