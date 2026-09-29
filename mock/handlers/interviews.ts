import { http, HttpResponse } from 'msw'

import { findApplicationRecord, resolveApplication } from '../data/applications'
import { pushAuditLog } from '../data/auditLogs'
import {
  findInterviewRecord,
  interviews,
  nextInterviewRecordId,
  resolveInterview,
} from '../data/interviews'
import { pushNotification } from '../data/notifications'
import { users } from '../data/users'
import { requireAuth } from '../utils/auth'

import type { InterviewRecord } from '../data/interviews'
import type {
  CreateInterviewInput,
  SubmitFeedbackInput,
  UpdateInterviewInput,
} from '../../src/types/interview'

const REQUIRED_FIELDS: Array<keyof CreateInterviewInput> = [
  'applicationId',
  'interviewerId',
  'stage',
  'date',
  'time',
  'durationMinutes',
  'mode',
  'status',
]

function findMissingField(
  body: Partial<CreateInterviewInput>,
): keyof CreateInterviewInput | undefined {
  return REQUIRED_FIELDS.find((field) => {
    const value = body[field]

    return value === undefined || value === null || value === ''
  })
}

function badRequest(message: string) {
  return HttpResponse.json({ success: false, message }, { status: 400 })
}

function notFound(message: string) {
  return HttpResponse.json(
    { success: false, message, data: null },
    { status: 404 },
  )
}

function hasScheduleConflict(
  interviewerId: number,
  date: string,
  time: string,
  excludeId?: number,
): boolean {
  return interviews.some(
    (item) =>
      item.id !== excludeId &&
      item.interviewerId === interviewerId &&
      item.status === 'scheduled' &&
      item.date === date &&
      item.time === time,
  )
}

function buildTargetName(record: InterviewRecord): string {
  const resolved = resolveInterview(record)

  return `${resolved.candidateName} - ${resolved.jobTitle}`
}

export const interviewHandlers = [
  // --------------------------------------------------
  // GET /api/interviews
  // --------------------------------------------------

  http.get('/api/interviews', ({ request }) => {
    const auth = requireAuth(request, 'interview.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const status = url.searchParams.get('status')
    const candidateId = url.searchParams.get('candidateId')
    const interviewerId = url.searchParams.get('interviewerId')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 50)

    let result = [...interviews]

    if (from) {
      result = result.filter((item) => item.date >= from)
    }

    if (to) {
      result = result.filter((item) => item.date <= to)
    }

    if (status) {
      result = result.filter((item) => item.status === status)
    }

    if (candidateId) {
      result = result.filter(
        (item) => item.candidateId === Number(candidateId),
      )
    }

    if (interviewerId) {
      result = result.filter(
        (item) => item.interviewerId === Number(interviewerId),
      )
    }

    result.sort((a, b) => {
      const keyA = `${a.date} ${a.time}`
      const keyB = `${b.date} ${b.time}`

      return keyA.localeCompare(keyB)
    })

    const total = result.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize

    return HttpResponse.json({
      success: true,
      data: result
        .slice(startIndex, startIndex + pageSize)
        .map(resolveInterview),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  }),

  // --------------------------------------------------
  // GET /api/interviews/:id
  // --------------------------------------------------

  http.get('/api/interviews/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'interview.read')

    if (!auth.ok) {
      return auth.response
    }

    const record = findInterviewRecord(Number(params.id))

    if (!record) {
      return notFound('找不到指定面試')
    }

    return HttpResponse.json({
      success: true,
      data: resolveInterview(record),
    })
  }),

  // --------------------------------------------------
  // POST /api/interviews
  // --------------------------------------------------

  http.post('/api/interviews', async ({ request }) => {
    const auth = requireAuth(request, 'interview.create')

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as Partial<CreateInterviewInput>

    const missingField = findMissingField(body)

    if (missingField) {
      return badRequest(`缺少必要欄位: ${missingField}`)
    }

    const application = findApplicationRecord(Number(body.applicationId))

    if (!application) {
      return notFound('找不到指定應徵紀錄')
    }

    const interviewer = users.find(
      (user) => user.id === Number(body.interviewerId),
    )

    if (!interviewer) {
      return notFound('找不到指定面試官')
    }

    if (
      hasScheduleConflict(
        interviewer.id,
        body.date as string,
        body.time as string,
      )
    ) {
      return HttpResponse.json(
        {
          success: false,
          message: '該面試官在此時段已有其他面試',
        },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()

    const newRecord: InterviewRecord = {
      id: nextInterviewRecordId(),
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      interviewerId: interviewer.id,
      stage: body.stage as CreateInterviewInput['stage'],
      date: body.date as string,
      time: body.time as string,
      durationMinutes: Number(body.durationMinutes),
      mode: body.mode as CreateInterviewInput['mode'],
      meetingLink: body.meetingLink ?? '',
      location: body.location ?? '',
      notes: body.notes ?? '',
      status: body.status as CreateInterviewInput['status'],
      feedback: null,
      createdAt: now,
      updatedAt: now,
    }

    interviews.push(newRecord)

    const resolved = resolveInterview(newRecord)
    const targetName = `${resolved.candidateName} - ${resolved.jobTitle}`

    pushAuditLog(auth.user, {
      action: 'create',
      targetType: 'interview',
      targetId: newRecord.id,
      targetName,
      details: `建立面試（${newRecord.date} ${newRecord.time}）`,
    })

    const recipients = new Set([interviewer.id, 2])

    recipients.forEach((userId) => {
      pushNotification({
        userId,
        type: 'interview_scheduled',
        title: '面試已排定',
        message: `${targetName} 的面試已排定於 ${newRecord.date} ${newRecord.time}。`,
        link: '/admin/interviews',
      })
    })

    return HttpResponse.json(
      {
        success: true,
        data: resolved,
      },
      { status: 201 },
    )
  }),

  // --------------------------------------------------
  // PUT /api/interviews/:id
  // --------------------------------------------------

  http.put('/api/interviews/:id', async ({ params, request }) => {
    const auth = requireAuth(request, 'interview.update')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const index = interviews.findIndex((item) => item.id === id)

    if (index === -1) {
      return notFound('找不到指定面試')
    }

    const body = (await request.json()) as Partial<UpdateInterviewInput>

    const missingField = findMissingField(body)

    if (missingField) {
      return badRequest(`缺少必要欄位: ${missingField}`)
    }

    const application = findApplicationRecord(Number(body.applicationId))

    if (!application) {
      return notFound('找不到指定應徵紀錄')
    }

    const interviewer = users.find(
      (user) => user.id === Number(body.interviewerId),
    )

    if (!interviewer) {
      return notFound('找不到指定面試官')
    }

    if (
      hasScheduleConflict(
        interviewer.id,
        body.date as string,
        body.time as string,
        id,
      )
    ) {
      return HttpResponse.json(
        {
          success: false,
          message: '該面試官在此時段已有其他面試',
        },
        { status: 409 },
      )
    }

    const existing = interviews[index]

    const updated: InterviewRecord = {
      ...existing,
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      interviewerId: interviewer.id,
      stage: body.stage as UpdateInterviewInput['stage'],
      date: body.date as string,
      time: body.time as string,
      durationMinutes: Number(body.durationMinutes),
      mode: body.mode as UpdateInterviewInput['mode'],
      meetingLink: body.meetingLink ?? '',
      location: body.location ?? '',
      notes: body.notes ?? '',
      status: body.status as UpdateInterviewInput['status'],
      updatedAt: new Date().toISOString(),
    }

    interviews[index] = updated

    const resolved = resolveInterview(updated)
    const targetName = `${resolved.candidateName} - ${resolved.jobTitle}`

    const scheduleChanged =
      existing.date !== updated.date || existing.time !== updated.time

    pushAuditLog(auth.user, {
      action: 'update',
      targetType: 'interview',
      targetId: updated.id,
      targetName,
      details:
        existing.status !== updated.status
          ? `狀態由 ${existing.status} 改為 ${updated.status}`
          : scheduleChanged
            ? `面試時間改為 ${updated.date} ${updated.time}`
            : '更新面試資料',
    })

    if (scheduleChanged) {
      pushNotification({
        userId: interviewer.id,
        type: 'interview_scheduled',
        title: '面試時間異動',
        message: `${targetName} 的面試已改為 ${updated.date} ${updated.time}。`,
        link: '/admin/interviews',
      })
    }

    return HttpResponse.json({
      success: true,
      data: resolved,
    })
  }),

  // --------------------------------------------------
  // DELETE /api/interviews/:id
  // --------------------------------------------------

  http.delete('/api/interviews/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'interview.delete')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const index = interviews.findIndex((item) => item.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: '找不到指定面試' },
        { status: 404 },
      )
    }

    const [removed] = interviews.splice(index, 1)

    pushAuditLog(auth.user, {
      action: 'delete',
      targetType: 'interview',
      targetId: removed.id,
      targetName: buildTargetName(removed),
      details: `刪除面試（${removed.date} ${removed.time}）`,
    })

    return HttpResponse.json({
      success: true,
      message: '面試已刪除',
    })
  }),

  // --------------------------------------------------
  // POST /api/interviews/:id/feedback
  // --------------------------------------------------

  http.post('/api/interviews/:id/feedback', async ({ params, request }) => {
    const auth = requireAuth(request, 'interview.feedback')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const record = findInterviewRecord(id)

    if (!record) {
      return notFound('找不到指定面試')
    }

    const isAdmin = auth.user.permissions.includes('*')

    if (record.interviewerId !== auth.user.id && !isAdmin) {
      return HttpResponse.json(
        {
          success: false,
          message: '只有指派的面試官可以填寫回饋',
          data: null,
        },
        { status: 403 },
      )
    }

    if (record.status === 'cancelled') {
      return HttpResponse.json(
        {
          success: false,
          message: '已取消的面試無法填寫回饋',
          data: null,
        },
        { status: 409 },
      )
    }

    const body = (await request.json()) as Partial<SubmitFeedbackInput>

    const score = Number(body.score)

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return badRequest('評分需為 1 至 5 的整數')
    }

    const feedback = body.feedback?.trim()

    if (!feedback) {
      return badRequest('請輸入面試回饋')
    }

    record.feedback = {
      score,
      feedback,
      notes: body.notes?.trim() ?? '',
      submittedById: auth.user.id,
      submittedByName: auth.user.name,
      submittedAt: new Date().toISOString(),
    }

    record.status = 'completed'
    record.updatedAt = new Date().toISOString()

    pushAuditLog(auth.user, {
      action: 'feedback',
      targetType: 'interview',
      targetId: record.id,
      targetName: buildTargetName(record),
      details: `提交面試回饋，評分 ${score} / 5`,
    })

    return HttpResponse.json({
      success: true,
      data: resolveInterview(record),
    })
  }),
]

// resolveApplication 供未來擴充使用時保留 import 一致性
void resolveApplication
