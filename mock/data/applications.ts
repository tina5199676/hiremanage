import { candidates } from './candidates'
import { jobs } from './jobs'

import type {
  Application,
  ApplicationStatus,
} from '../../src/types/application'

/**
 * 儲存在「資料庫」的 Application 只保留關聯 id，
 * candidateName / jobTitle 等顯示欄位由 Mock API 在回應時解析。
 */
export type ApplicationRecord = Omit<
  Application,
  'candidateName' | 'jobTitle' | 'jobDepartment'
>

function record(
  id: number,
  candidateId: number,
  jobId: number,
  status: ApplicationStatus,
  appliedAt: string,
  updatedAt: string,
  note = '',
): ApplicationRecord {
  return {
    id,
    candidateId,
    jobId,
    status,
    note,
    appliedAt,
    updatedAt,
  }
}

export const applications: ApplicationRecord[] = [
  record(1, 1, 1, 'interview', '2026-09-05T02:00:00Z', '2026-09-25T06:30:00Z', '由 LinkedIn 主動聯繫'),
  record(2, 2, 2, 'interview', '2026-09-08T03:30:00Z', '2026-09-26T01:15:00Z'),
  record(3, 3, 3, 'screening', '2026-09-10T07:00:00Z', '2026-09-18T02:00:00Z'),
  record(4, 4, 6, 'applied', '2026-09-25T09:00:00Z', '2026-09-25T09:00:00Z'),
  record(5, 5, 5, 'offer', '2026-08-28T01:00:00Z', '2026-09-24T08:00:00Z', '薪資期待略高於預算，需協調'),
  record(6, 6, 7, 'applied', '2026-09-26T06:20:00Z', '2026-09-26T06:20:00Z'),
  record(7, 7, 8, 'hired', '2026-08-15T02:00:00Z', '2026-09-27T08:45:00Z'),
  record(8, 8, 4, 'rejected', '2026-08-20T03:00:00Z', '2026-09-01T05:00:00Z', '技術面試未通過'),
  record(9, 9, 16, 'screening', '2026-09-18T01:30:00Z', '2026-09-22T04:00:00Z'),
  record(10, 10, 20, 'applied', '2026-09-27T10:00:00Z', '2026-09-27T10:00:00Z'),
  record(11, 11, 13, 'interview', '2026-09-12T05:00:00Z', '2026-09-23T03:00:00Z'),
  record(12, 12, 17, 'screening', '2026-09-20T02:45:00Z', '2026-09-24T02:00:00Z'),
  record(13, 13, 12, 'applied', '2026-09-28T01:00:00Z', '2026-09-28T01:00:00Z'),
  record(14, 14, 2, 'rejected', '2026-09-02T06:00:00Z', '2026-09-12T07:30:00Z', '經驗與職缺需求不符'),
  record(15, 15, 15, 'offer', '2026-09-01T02:30:00Z', '2026-09-26T09:00:00Z'),
  record(16, 16, 1, 'applied', '2026-09-22T08:00:00Z', '2026-09-22T08:00:00Z'),
  record(17, 17, 11, 'screening', '2026-09-15T03:00:00Z', '2026-09-19T06:00:00Z'),
  record(18, 18, 21, 'interview', '2026-09-03T04:00:00Z', '2026-09-21T02:00:00Z'),
]

let nextApplicationId = applications.length + 1

export function nextApplicationRecordId(): number {
  const id = nextApplicationId

  nextApplicationId += 1

  return id
}

export function findApplicationRecord(
  id: number,
): ApplicationRecord | undefined {
  return applications.find((item) => item.id === id)
}

/**
 * 將 record 補上候選人與職缺顯示資訊，模擬後端 JOIN。
 */
export function resolveApplication(
  item: ApplicationRecord,
): Application {
  const candidate = candidates.find((c) => c.id === item.candidateId)
  const job = jobs.find((j) => j.id === item.jobId)

  return {
    ...item,
    candidateName: candidate?.name ?? '（已刪除的候選人）',
    jobTitle: job?.title ?? '（已刪除的職缺）',
    jobDepartment: job?.department ?? '-',
  }
}
