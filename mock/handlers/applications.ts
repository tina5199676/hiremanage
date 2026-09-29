import { http, HttpResponse } from 'msw'

import {
  applications,
  findApplicationRecord,
  nextApplicationRecordId,
  resolveApplication,
} from '../data/applications'
import { pushAuditLog } from '../data/auditLogs'
import { candidates } from '../data/candidates'
import { jobs } from '../data/jobs'
import { pushNotification } from '../data/notifications'
import { requireAuth } from '../utils/auth'

import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from '../../src/types/application'

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === 'string' &&
    APPLICATION_STATUSES.includes(value as ApplicationStatus)
  )
}

function notFoundResponse() {
  return HttpResponse.json(
    {
      success: false,
      message: '找不到指定應徵紀錄',
      data: null,
    },
    { status: 404 },
  )
}

function byUpdatedAtDesc(a: Application, b: Application): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}

export const applicationHandlers = [
  // --------------------------------------------------
  // GET /api/applications
  // --------------------------------------------------

  http.get('/api/applications', ({ request }) => {
    const auth = requireAuth(request, 'application.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')
    const jobId = url.searchParams.get('jobId')
    const candidateId = url.searchParams.get('candidateId')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const sortBy = url.searchParams.get('sortBy') ?? 'appliedAt'
    const sortOrder = url.searchParams.get('sortOrder') ?? 'desc'

    let result = applications.map(resolveApplication)

    if (search) {
      result = result.filter((item) => {
        return (
          item.candidateName.toLowerCase().includes(search) ||
          item.jobTitle.toLowerCase().includes(search)
        )
      })
    }

    if (status) {
      result = result.filter((item) => item.status === status)
    }

    if (jobId) {
      result = result.filter((item) => item.jobId === Number(jobId))
    }

    if (candidateId) {
      result = result.filter(
        (item) => item.candidateId === Number(candidateId),
      )
    }

    result.sort((a, b) => {
      let valueA: string | number
      let valueB: string | number

      switch (sortBy) {
        case 'candidateName':
          valueA = a.candidateName
          valueB = b.candidateName
          break

        case 'updatedAt':
          valueA = new Date(a.updatedAt).getTime()
          valueB = new Date(b.updatedAt).getTime()
          break

        case 'appliedAt':
        default:
          valueA = new Date(a.appliedAt).getTime()
          valueB = new Date(b.appliedAt).getTime()
          break
      }

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1
      }

      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1
      }

      return 0
    })

    const total = result.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize

    return HttpResponse.json({
      success: true,
      data: result.slice(startIndex, startIndex + pageSize),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  }),

  // --------------------------------------------------
  // GET /api/applications/board
  // --------------------------------------------------

  http.get('/api/applications/board', ({ request }) => {
    const auth = requireAuth(request, 'application.read')

    if (!auth.ok) {
      return auth.response
    }

    const board = {} as Record<ApplicationStatus, Application[]>

    APPLICATION_STATUSES.forEach((status) => {
      board[status] = applications
        .filter((item) => item.status === status)
        .map(resolveApplication)
        .sort(byUpdatedAtDesc)
    })

    return HttpResponse.json({
      success: true,
      data: board,
    })
  }),

  // --------------------------------------------------
  // GET /api/applications/:id
  // --------------------------------------------------

  http.get('/api/applications/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'application.read')

    if (!auth.ok) {
      return auth.response
    }

    const record = findApplicationRecord(Number(params.id))

    if (!record) {
      return notFoundResponse()
    }

    return HttpResponse.json({
      success: true,
      data: resolveApplication(record),
    })
  }),

  // --------------------------------------------------
  // POST /api/applications
  // --------------------------------------------------

  http.post('/api/applications', async ({ request }) => {
    const auth = requireAuth(request, 'application.create')

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as Partial<CreateApplicationInput>

    const candidateId = Number(body.candidateId)
    const jobId = Number(body.jobId)

    if (
      !body.candidateId ||
      !body.jobId ||
      !Number.isInteger(candidateId) ||
      !Number.isInteger(jobId) ||
      !isApplicationStatus(body.status)
    ) {
      return HttpResponse.json(
        {
          success: false,
          message: '缺少必要欄位: candidateId / jobId / status',
        },
        { status: 400 },
      )
    }

    const candidate = candidates.find((item) => item.id === candidateId)

    if (!candidate) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
        },
        { status: 404 },
      )
    }

    const job = jobs.find((item) => item.id === jobId)

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定職缺',
        },
        { status: 404 },
      )
    }

    const duplicated = applications.some(
      (item) => item.candidateId === candidateId && item.jobId === jobId,
    )

    if (duplicated) {
      return HttpResponse.json(
        {
          success: false,
          message: '此候選人已應徵過此職缺',
        },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()

    const record = {
      id: nextApplicationRecordId(),
      candidateId,
      jobId,
      status: body.status,
      note: typeof body.note === 'string' ? body.note.trim() : '',
      appliedAt: now,
      updatedAt: now,
    }

    applications.push(record)

    const application = resolveApplication(record)

    pushAuditLog(auth.user, {
      action: 'create',
      targetType: 'application',
      targetId: application.id,
      targetName: `${application.candidateName} - ${application.jobTitle}`,
      details: `建立應徵紀錄（${application.status}）`,
    })

    pushNotification({
      userId: 2,
      type: 'application_updated',
      title: '新的應徵',
      message: `${application.candidateName} 應徵了 ${application.jobTitle}。`,
      link: '/admin/applications',
    })

    return HttpResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 201 },
    )
  }),

  // --------------------------------------------------
  // PATCH /api/applications/:id/status
  // --------------------------------------------------

  http.patch(
    '/api/applications/:id/status',
    async ({ params, request }) => {
      const auth = requireAuth(request, 'application.update')

      if (!auth.ok) {
        return auth.response
      }

      const record = findApplicationRecord(Number(params.id))

      if (!record) {
        return notFoundResponse()
      }

      const body =
        (await request.json()) as Partial<UpdateApplicationStatusInput>

      if (!isApplicationStatus(body.status)) {
        return HttpResponse.json(
          {
            success: false,
            message: '無效的應徵狀態',
          },
          { status: 400 },
        )
      }

      if (record.status === body.status) {
        return HttpResponse.json(
          {
            success: false,
            message: '應徵狀態未變更',
          },
          { status: 409 },
        )
      }

      const previousStatus = record.status

      record.status = body.status
      record.updatedAt = new Date().toISOString()

      const application = resolveApplication(record)

      pushAuditLog(auth.user, {
        action: 'status-change',
        targetType: 'application',
        targetId: application.id,
        targetName: `${application.candidateName} - ${application.jobTitle}`,
        details: `狀態由 ${previousStatus} 改為 ${application.status}`,
      })

      const notificationInput = {
        type: 'application_updated' as const,
        title: '應徵狀態更新',
        message: `${application.candidateName}（${application.jobTitle}）已進入 ${application.status} 階段。`,
        link: '/admin/applications',
      }

      pushNotification({ userId: 2, ...notificationInput })
      pushNotification({ userId: 3, ...notificationInput })

      return HttpResponse.json({
        success: true,
        data: application,
      })
    },
  ),

  // --------------------------------------------------
  // PUT /api/applications/:id
  // --------------------------------------------------

  http.put('/api/applications/:id', async ({ params, request }) => {
    const auth = requireAuth(request, 'application.update')

    if (!auth.ok) {
      return auth.response
    }

    const record = findApplicationRecord(Number(params.id))

    if (!record) {
      return notFoundResponse()
    }

    const body = (await request.json()) as Partial<
      Pick<CreateApplicationInput, 'status' | 'note'>
    >

    if (!isApplicationStatus(body.status)) {
      return HttpResponse.json(
        {
          success: false,
          message: '無效的應徵狀態',
        },
        { status: 400 },
      )
    }

    if (typeof body.note !== 'string') {
      return HttpResponse.json(
        {
          success: false,
          message: '缺少必要欄位: note',
        },
        { status: 400 },
      )
    }

    const previousStatus = record.status

    record.status = body.status
    record.note = body.note.trim()
    record.updatedAt = new Date().toISOString()

    const application = resolveApplication(record)

    pushAuditLog(auth.user, {
      action: 'update',
      targetType: 'application',
      targetId: application.id,
      targetName: `${application.candidateName} - ${application.jobTitle}`,
      details:
        previousStatus !== application.status
          ? `狀態由 ${previousStatus} 改為 ${application.status}`
          : '更新應徵備註',
    })

    return HttpResponse.json({
      success: true,
      data: application,
    })
  }),

  // --------------------------------------------------
  // DELETE /api/applications/:id
  // --------------------------------------------------

  http.delete('/api/applications/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'application.delete')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const index = applications.findIndex((item) => item.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定應徵紀錄',
        },
        { status: 404 },
      )
    }

    const [removed] = applications.splice(index, 1)

    const application = resolveApplication(removed)

    pushAuditLog(auth.user, {
      action: 'delete',
      targetType: 'application',
      targetId: application.id,
      targetName: `${application.candidateName} - ${application.jobTitle}`,
      details: '刪除應徵紀錄',
    })

    return HttpResponse.json({
      success: true,
      message: '應徵紀錄已刪除',
    })
  }),
]
