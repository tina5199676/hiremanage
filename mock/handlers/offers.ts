import { http, HttpResponse } from 'msw'

import { applications, findApplicationRecord } from '../data/applications'
import { pushAuditLog } from '../data/auditLogs'
import { pushNotification } from '../data/notifications'
import {
  findOfferRecord,
  nextOfferRecordId,
  offers,
  resolveOffer,
} from '../data/offers'
import { requireAuth } from '../utils/auth'

import type {
  CreateOfferInput,
  OfferStatus,
  UpdateOfferInput,
  UpdateOfferStatusInput,
} from '../../src/types/offer'

import type { OfferRecord } from '../data/offers'

const REQUIRED_FIELDS: Array<keyof UpdateOfferInput> = [
  'salary',
  'startDate',
  'expirationDate',
  'benefits',
  'message',
  'status',
]

const OFFER_STATUSES: OfferStatus[] = ['draft', 'sent', 'accepted', 'rejected']

const ALLOWED_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
}

function findMissingField(
  body: Partial<UpdateOfferInput>,
): keyof UpdateOfferInput | undefined {
  return REQUIRED_FIELDS.find((field) => {
    const value = body[field]

    if (field === 'benefits') {
      return !Array.isArray(value)
    }

    return value === undefined || value === null || value === ''
  })
}

function invalidBodyResponse(message: string) {
  return HttpResponse.json(
    {
      success: false,
      message,
    },
    { status: 400 },
  )
}

function notFoundResponse() {
  return HttpResponse.json(
    {
      success: false,
      message: '找不到指定 Offer',
      data: null,
    },
    { status: 404 },
  )
}

function conflictResponse(message: string) {
  return HttpResponse.json(
    {
      success: false,
      message,
    },
    { status: 409 },
  )
}

function targetName(record: OfferRecord): string {
  const resolved = resolveOffer(record)

  return `${resolved.candidateName} - ${resolved.jobTitle}`
}

export const offerHandlers = [
  // --------------------------------------------------
  // GET /api/offers
  // --------------------------------------------------

  http.get('/api/offers', ({ request }) => {
    const auth = requireAuth(request, 'offer.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')
    const candidateId = url.searchParams.get('candidateId')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const sortBy = url.searchParams.get('sortBy') ?? 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') ?? 'desc'

    let result = offers.map(resolveOffer)

    if (search) {
      result = result.filter((offer) => {
        return (
          offer.candidateName.toLowerCase().includes(search) ||
          offer.jobTitle.toLowerCase().includes(search)
        )
      })
    }

    if (status) {
      result = result.filter((offer) => offer.status === status)
    }

    if (candidateId) {
      result = result.filter(
        (offer) => offer.candidateId === Number(candidateId),
      )
    }

    result.sort((a, b) => {
      let valueA: string | number
      let valueB: string | number

      switch (sortBy) {
        case 'salary':
          valueA = a.salary
          valueB = b.salary
          break

        case 'startDate':
          valueA = a.startDate
          valueB = b.startDate
          break

        case 'expirationDate':
          valueA = a.expirationDate
          valueB = b.expirationDate
          break

        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
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
  // GET /api/offers/:id
  // --------------------------------------------------

  http.get('/api/offers/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'offer.read')

    if (!auth.ok) {
      return auth.response
    }

    const record = findOfferRecord(Number(params.id))

    if (!record) {
      return notFoundResponse()
    }

    return HttpResponse.json({
      success: true,
      data: resolveOffer(record),
    })
  }),

  // --------------------------------------------------
  // POST /api/offers
  // --------------------------------------------------

  http.post('/api/offers', async ({ request }) => {
    const auth = requireAuth(request, 'offer.create')

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as Partial<CreateOfferInput>

    if (body.applicationId === undefined || body.applicationId === null) {
      return invalidBodyResponse('缺少必要欄位: applicationId')
    }

    const missingField = findMissingField(body)

    if (missingField) {
      return invalidBodyResponse(`缺少必要欄位: ${missingField}`)
    }

    if (!OFFER_STATUSES.includes(body.status as OfferStatus)) {
      return invalidBodyResponse('無效的 Offer 狀態')
    }

    const application = findApplicationRecord(Number(body.applicationId))

    if (!application) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定應徵紀錄',
        },
        { status: 404 },
      )
    }

    const activeOfferExists = offers.some(
      (offer) =>
        offer.applicationId === application.id &&
        offer.status !== 'rejected',
    )

    if (activeOfferExists) {
      return conflictResponse('此應徵紀錄已有進行中的 Offer')
    }

    const now = new Date().toISOString()

    const newOffer: OfferRecord = {
      id: nextOfferRecordId(),
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      salary: Number(body.salary),
      startDate: body.startDate as string,
      expirationDate: body.expirationDate as string,
      benefits: body.benefits as string[],
      message: body.message as string,
      status: body.status as OfferStatus,
      createdAt: now,
      updatedAt: now,
    }

    offers.push(newOffer)

    pushAuditLog(auth.user, {
      action: 'create',
      targetType: 'offer',
      targetId: newOffer.id,
      targetName: targetName(newOffer),
      details: `建立 Offer（狀態：${newOffer.status}）`,
    })

    return HttpResponse.json(
      {
        success: true,
        data: resolveOffer(newOffer),
      },
      { status: 201 },
    )
  }),

  // --------------------------------------------------
  // PUT /api/offers/:id
  // --------------------------------------------------

  http.put('/api/offers/:id', async ({ params, request }) => {
    const auth = requireAuth(request, 'offer.update')

    if (!auth.ok) {
      return auth.response
    }

    const index = offers.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return notFoundResponse()
    }

    const existing = offers[index]

    if (existing.status === 'accepted') {
      return conflictResponse('已接受的 Offer 不可修改')
    }

    const body = (await request.json()) as Partial<UpdateOfferInput>

    const missingField = findMissingField(body)

    if (missingField) {
      return invalidBodyResponse(`缺少必要欄位: ${missingField}`)
    }

    if (!OFFER_STATUSES.includes(body.status as OfferStatus)) {
      return invalidBodyResponse('無效的 Offer 狀態')
    }

    const updated: OfferRecord = {
      ...existing,
      salary: Number(body.salary),
      startDate: body.startDate as string,
      expirationDate: body.expirationDate as string,
      benefits: body.benefits as string[],
      message: body.message as string,
      status: body.status as OfferStatus,
      updatedAt: new Date().toISOString(),
    }

    offers[index] = updated

    pushAuditLog(auth.user, {
      action: 'update',
      targetType: 'offer',
      targetId: updated.id,
      targetName: targetName(updated),
      details:
        existing.status !== updated.status
          ? `狀態由 ${existing.status} 改為 ${updated.status}`
          : '更新 Offer 資料',
    })

    return HttpResponse.json({
      success: true,
      data: resolveOffer(updated),
    })
  }),

  // --------------------------------------------------
  // PATCH /api/offers/:id/status
  // --------------------------------------------------

  http.patch('/api/offers/:id/status', async ({ params, request }) => {
    const auth = requireAuth(request, 'offer.update')

    if (!auth.ok) {
      return auth.response
    }

    const record = findOfferRecord(Number(params.id))

    if (!record) {
      return notFoundResponse()
    }

    const body = (await request.json()) as Partial<UpdateOfferStatusInput>

    const nextStatus = body.status

    if (!nextStatus || !OFFER_STATUSES.includes(nextStatus)) {
      return invalidBodyResponse('無效的 Offer 狀態')
    }

    if (!ALLOWED_TRANSITIONS[record.status].includes(nextStatus)) {
      return conflictResponse(`無法由 ${record.status} 變更為 ${nextStatus}`)
    }

    const previousStatus = record.status

    record.status = nextStatus
    record.updatedAt = new Date().toISOString()

    const resolved = resolveOffer(record)

    if (nextStatus === 'accepted') {
      const application = applications.find(
        (app) => app.id === record.applicationId,
      )

      if (application) {
        application.status = 'hired'
        application.updatedAt = record.updatedAt
      }

      pushNotification({
        userId: 2,
        type: 'offer_accepted',
        title: 'Offer 已接受',
        message: `${resolved.candidateName}已接受 ${resolved.jobTitle} 的 Offer。`,
        link: '/admin/offers',
      })
    }

    if (nextStatus === 'rejected') {
      pushNotification({
        userId: 2,
        type: 'offer_rejected',
        title: 'Offer 已拒絕',
        message: `${resolved.candidateName}已拒絕 ${resolved.jobTitle} 的 Offer。`,
        link: '/admin/offers',
      })
    }

    pushAuditLog(auth.user, {
      action: 'status-change',
      targetType: 'offer',
      targetId: record.id,
      targetName: targetName(record),
      details: `狀態由 ${previousStatus} 改為 ${nextStatus}`,
    })

    return HttpResponse.json({
      success: true,
      data: resolved,
    })
  }),

  // --------------------------------------------------
  // DELETE /api/offers/:id
  // --------------------------------------------------

  http.delete('/api/offers/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'offer.delete')

    if (!auth.ok) {
      return auth.response
    }

    const index = offers.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定 Offer',
        },
        { status: 404 },
      )
    }

    if (offers[index].status === 'accepted') {
      return conflictResponse('已接受的 Offer 不可刪除')
    }

    const [removed] = offers.splice(index, 1)

    pushAuditLog(auth.user, {
      action: 'delete',
      targetType: 'offer',
      targetId: removed.id,
      targetName: targetName(removed),
      details: '刪除 Offer',
    })

    return HttpResponse.json({
      success: true,
      message: 'Offer 已刪除',
    })
  }),
]
