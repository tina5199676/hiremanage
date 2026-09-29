import { resolveApplication, findApplicationRecord } from './applications'
import { users } from './users'

import type {
  Interview,
  InterviewFeedback,
  InterviewMode,
  InterviewStage,
  InterviewStatus,
} from '../../src/types/interview'

/**
 * 儲存在「資料庫」的 Interview 只保留關聯 id，
 * candidateName / jobTitle / interviewerName 由 Mock API 在回應時解析。
 */
export type InterviewRecord = Omit<
  Interview,
  'candidateName' | 'jobTitle' | 'interviewerName'
>

interface RecordInput {
  id: number
  applicationId: number
  interviewerId: number
  stage: InterviewStage
  date: string
  time: string
  durationMinutes?: number
  mode: InterviewMode
  meetingLink?: string
  location?: string
  notes?: string
  status: InterviewStatus
  feedback?: InterviewFeedback | null
  createdAt: string
  updatedAt: string
}

function record(input: RecordInput): InterviewRecord {
  const application = findApplicationRecord(input.applicationId)

  return {
    id: input.id,
    applicationId: input.applicationId,
    candidateId: application?.candidateId ?? 0,
    jobId: application?.jobId ?? 0,
    interviewerId: input.interviewerId,
    stage: input.stage,
    date: input.date,
    time: input.time,
    durationMinutes: input.durationMinutes ?? 60,
    mode: input.mode,
    meetingLink: input.meetingLink ?? '',
    location: input.location ?? '',
    notes: input.notes ?? '',
    status: input.status,
    feedback: input.feedback ?? null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }
}

export const interviews: InterviewRecord[] = [
  record({
    id: 1,
    applicationId: 1,
    interviewerId: 3,
    stage: 'technical',
    date: '2026-10-01',
    time: '14:00',
    durationMinutes: 90,
    mode: 'video',
    meetingLink: 'https://meet.example.com/hiremanage-1001',
    notes: '請候選人準備過去專案的架構說明。',
    status: 'scheduled',
    createdAt: '2026-09-25T06:30:00Z',
    updatedAt: '2026-09-25T06:30:00Z',
  }),
  record({
    id: 2,
    applicationId: 2,
    interviewerId: 3,
    stage: 'phone-screen',
    date: '2026-09-24',
    time: '10:00',
    durationMinutes: 30,
    mode: 'phone',
    status: 'completed',
    feedback: {
      score: 4,
      feedback: '溝通清楚，對後端架構與資料庫設計有扎實理解。',
      notes: '建議進入技術面試，確認系統設計能力。',
      submittedById: 3,
      submittedByName: '李冠廷',
      submittedAt: '2026-09-27T09:00:00Z',
    },
    createdAt: '2026-09-20T02:00:00Z',
    updatedAt: '2026-09-27T09:00:00Z',
  }),
  record({
    id: 3,
    applicationId: 2,
    interviewerId: 2,
    stage: 'technical',
    date: '2026-09-30',
    time: '10:00',
    durationMinutes: 60,
    mode: 'video',
    meetingLink: 'https://meet.example.com/hiremanage-1003',
    status: 'scheduled',
    createdAt: '2026-09-26T01:15:00Z',
    updatedAt: '2026-09-26T01:15:00Z',
  }),
  record({
    id: 4,
    applicationId: 5,
    interviewerId: 3,
    stage: 'final',
    date: '2026-09-22',
    time: '15:00',
    durationMinutes: 60,
    mode: 'onsite',
    location: '台北辦公室 5F 會議室 A',
    status: 'completed',
    feedback: {
      score: 5,
      feedback: 'DevOps 實務經驗豐富，對 CI/CD 與容器化流程掌握度高。',
      notes: '建議發出 Offer。',
      submittedById: 3,
      submittedByName: '李冠廷',
      submittedAt: '2026-09-23T02:00:00Z',
    },
    createdAt: '2026-09-15T03:00:00Z',
    updatedAt: '2026-09-23T02:00:00Z',
  }),
  record({
    id: 5,
    applicationId: 7,
    interviewerId: 1,
    stage: 'hiring-manager',
    date: '2026-09-10',
    time: '11:00',
    durationMinutes: 45,
    mode: 'onsite',
    location: '台北辦公室 6F 會議室 B',
    status: 'completed',
    feedback: {
      score: 5,
      feedback: '產品思維成熟，跨部門協作經驗豐富。',
      notes: '',
      submittedById: 1,
      submittedByName: '王建宏',
      submittedAt: '2026-09-10T08:00:00Z',
    },
    createdAt: '2026-09-03T02:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
  }),
  record({
    id: 6,
    applicationId: 11,
    interviewerId: 2,
    stage: 'phone-screen',
    date: '2026-09-29',
    time: '16:30',
    durationMinutes: 30,
    mode: 'phone',
    status: 'scheduled',
    createdAt: '2026-09-23T03:00:00Z',
    updatedAt: '2026-09-23T03:00:00Z',
  }),
  record({
    id: 7,
    applicationId: 15,
    interviewerId: 1,
    stage: 'final',
    date: '2026-09-18',
    time: '09:30',
    durationMinutes: 60,
    mode: 'video',
    meetingLink: 'https://meet.example.com/hiremanage-1007',
    status: 'cancelled',
    notes: '候選人臨時有事，改期另行安排。',
    createdAt: '2026-09-12T02:00:00Z',
    updatedAt: '2026-09-17T06:00:00Z',
  }),
  record({
    id: 8,
    applicationId: 15,
    interviewerId: 1,
    stage: 'final',
    date: '2026-10-06',
    time: '09:30',
    durationMinutes: 60,
    mode: 'video',
    meetingLink: 'https://meet.example.com/hiremanage-1008',
    status: 'scheduled',
    createdAt: '2026-09-18T02:00:00Z',
    updatedAt: '2026-09-18T02:00:00Z',
  }),
  record({
    id: 9,
    applicationId: 18,
    interviewerId: 3,
    stage: 'technical',
    date: '2026-10-08',
    time: '13:00',
    durationMinutes: 90,
    mode: 'onsite',
    location: '台北辦公室 5F 會議室 A',
    status: 'scheduled',
    createdAt: '2026-09-21T02:00:00Z',
    updatedAt: '2026-09-21T02:00:00Z',
  }),
  record({
    id: 10,
    applicationId: 18,
    interviewerId: 2,
    stage: 'phone-screen',
    date: '2026-09-15',
    time: '14:00',
    durationMinutes: 30,
    mode: 'phone',
    status: 'completed',
    feedback: {
      score: 3,
      feedback: '架構經驗符合需求，但對雲端服務的實務操作仍需確認。',
      notes: '安排技術面試進一步評估。',
      submittedById: 2,
      submittedByName: '張雅婷',
      submittedAt: '2026-09-15T09:00:00Z',
    },
    createdAt: '2026-09-08T02:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z',
  }),
  record({
    id: 11,
    applicationId: 1,
    interviewerId: 1,
    stage: 'final',
    date: '2026-10-15',
    time: '10:00',
    durationMinutes: 60,
    mode: 'onsite',
    location: '台北辦公室 6F 會議室 B',
    status: 'scheduled',
    createdAt: '2026-09-28T02:00:00Z',
    updatedAt: '2026-09-28T02:00:00Z',
  }),
]

let nextInterviewId = interviews.length + 1

export function nextInterviewRecordId(): number {
  const id = nextInterviewId

  nextInterviewId += 1

  return id
}

export function findInterviewRecord(
  id: number,
): InterviewRecord | undefined {
  return interviews.find((item) => item.id === id)
}

/**
 * 將 record 補上候選人、職缺與面試官顯示資訊，模擬後端 JOIN。
 */
export function resolveInterview(item: InterviewRecord): Interview {
  const application = findApplicationRecord(item.applicationId)

  const resolved = application ? resolveApplication(application) : null

  const interviewer = users.find((user) => user.id === item.interviewerId)

  return {
    ...item,
    candidateName: resolved?.candidateName ?? '（已刪除的候選人）',
    jobTitle: resolved?.jobTitle ?? '（已刪除的職缺）',
    interviewerName: interviewer?.name ?? '（已刪除的使用者）',
  }
}
