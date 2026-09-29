import { applications, resolveApplication } from './applications'

import type { Offer } from '../../src/types/offer'

/**
 * 儲存在「資料庫」的 Offer 只保留關聯 id，
 * candidateName / jobTitle 由 Mock API 在回應時解析。
 */
export type OfferRecord = Omit<Offer, 'candidateName' | 'jobTitle'>

export const offers: OfferRecord[] = [
  {
    id: 1,
    applicationId: 7,
    candidateId: 7,
    jobId: 8,
    salary: 95000,
    startDate: '2026-11-01',
    expirationDate: '2026-10-05',
    benefits: ['勞健保', '年終獎金', '彈性上下班', '教育訓練補助'],
    message:
      '感謝您參與 Product Manager 職缺的面試流程，我們很高興向您提出正式錄取通知。',
    status: 'accepted',
    createdAt: '2026-09-20T02:00:00Z',
    updatedAt: '2026-09-27T08:45:00Z',
  },
  {
    id: 2,
    applicationId: 5,
    candidateId: 5,
    jobId: 5,
    salary: 88000,
    startDate: '2026-11-16',
    expirationDate: '2026-10-10',
    benefits: ['勞健保', '年終獎金', '遠端工作', '設備補助'],
    message:
      '恭喜您通過 DevOps Engineer 的所有面試關卡，請於期限內回覆是否接受此 Offer。',
    status: 'sent',
    createdAt: '2026-09-24T08:00:00Z',
    updatedAt: '2026-09-24T08:00:00Z',
  },
  {
    id: 3,
    applicationId: 15,
    candidateId: 15,
    jobId: 15,
    salary: 130000,
    startDate: '2026-12-01',
    expirationDate: '2026-10-20',
    benefits: ['勞健保', '年終獎金', '股票選擇權', '主管培訓'],
    message: 'Engineering Manager 職缺錄取通知草稿，待主管核准後送出。',
    status: 'draft',
    createdAt: '2026-09-26T09:00:00Z',
    updatedAt: '2026-09-26T09:00:00Z',
  },
  {
    id: 4,
    applicationId: 8,
    candidateId: 8,
    jobId: 4,
    salary: 60000,
    startDate: '2026-09-15',
    expirationDate: '2026-08-31',
    benefits: ['勞健保', '年終獎金'],
    message: 'QA Engineer 職缺錄取通知。',
    status: 'rejected',
    createdAt: '2026-08-22T03:00:00Z',
    updatedAt: '2026-08-29T06:00:00Z',
  },
  {
    id: 5,
    applicationId: 18,
    candidateId: 18,
    jobId: 21,
    salary: 140000,
    startDate: '2026-11-02',
    expirationDate: '2026-10-15',
    benefits: ['勞健保', '年終獎金', '彈性上下班', '教育訓練補助', '健康檢查'],
    message: 'Solution Architect 職缺錄取通知草稿。',
    status: 'draft',
    createdAt: '2026-09-27T05:30:00Z',
    updatedAt: '2026-09-27T05:30:00Z',
  },
]

let nextOfferId = offers.length + 1

export function nextOfferRecordId(): number {
  const id = nextOfferId

  nextOfferId += 1

  return id
}

export function findOfferRecord(id: number): OfferRecord | undefined {
  return offers.find((item) => item.id === id)
}

/**
 * 將 record 補上候選人與職缺顯示資訊，模擬後端 JOIN。
 */
export function resolveOffer(item: OfferRecord): Offer {
  const application = applications.find(
    (app) => app.id === item.applicationId,
  )

  if (application) {
    const resolved = resolveApplication(application)

    return {
      ...item,
      candidateName: resolved.candidateName,
      jobTitle: resolved.jobTitle,
    }
  }

  return {
    ...item,
    candidateName: '（已刪除的候選人）',
    jobTitle: '（已刪除的職缺）',
  }
}
