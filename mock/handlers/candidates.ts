import { http, HttpResponse } from 'msw'

import { pushAuditLog } from '../data/auditLogs'
import {
  candidateNotes,
  nextCandidateNoteId,
} from '../data/candidateNotes'
import {
  applications,
  resolveApplication,
} from '../data/applications'
import { candidates } from '../data/candidates'
import { interviews, resolveInterview } from '../data/interviews'
import { offers, resolveOffer } from '../data/offers'
import { requireAuth } from '../utils/auth'

import type {
  Candidate,
  CandidateNote,
  CreateCandidateInput,
  CreateCandidateNoteInput,
  UpdateCandidateInput,
} from '../../src/types/candidate'

const REQUIRED_FIELDS: Array<keyof CreateCandidateInput> = [
  'name',
  'email',
  'phone',
  'currentTitle',
  'currentCompany',
  'location',
  'experience',
  'education',
  'skills',
  'source',
  'status',
]

function findMissingField(
  body: Partial<CreateCandidateInput>,
): keyof CreateCandidateInput | undefined {
  return REQUIRED_FIELDS.find((field) => {
    const value = body[field]

    return (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    )
  })
}

export const candidateHandlers = [
  // --------------------------------------------------
  // GET /api/candidates
  // --------------------------------------------------

  http.get('/api/candidates', ({ request }) => {
    const auth = requireAuth(request, 'candidate.read')

    if (!auth.ok) {
      return auth.response
    }

    const url = new URL(request.url)

    const search =
      url.searchParams
        .get('search')
        ?.toLowerCase()

    const status =
      url.searchParams.get('status')

    const source =
      url.searchParams.get('source')

    const page = Number(
      url.searchParams.get('page') ?? 1,
    )

    const pageSize = Number(
      url.searchParams.get('pageSize') ?? 10,
    )

    const sortBy =
      url.searchParams.get('sortBy') ??
      'createdAt'

    const sortOrder =
      url.searchParams.get('sortOrder') ??
      'desc'

    let result = [...candidates]

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search) {
      result = result.filter((candidate) => {
        return (
          candidate.name
            .toLowerCase()
            .includes(search) ||
          candidate.email
            .toLowerCase()
            .includes(search)
        )
      })
    }

    // --------------------------------------------------
    // Filter: status
    // --------------------------------------------------

    if (status) {
      result = result.filter((candidate) => {
        return candidate.status === status
      })
    }

    // --------------------------------------------------
    // Filter: source
    // --------------------------------------------------

    if (source) {
      result = result.filter((candidate) => {
        return candidate.source === source
      })
    }

    // --------------------------------------------------
    // Sort
    // --------------------------------------------------

    result.sort((a, b) => {
      let valueA: string | number
      let valueB: string | number

      switch (sortBy) {
        case 'name':
          valueA = a.name
          valueB = b.name
          break

        case 'updatedAt':
          valueA = new Date(
            a.updatedAt,
          ).getTime()

          valueB = new Date(
            b.updatedAt,
          ).getTime()

          break

        case 'createdAt':
        default:
          valueA = new Date(
            a.createdAt,
          ).getTime()

          valueB = new Date(
            b.createdAt,
          ).getTime()

          break
      }

      if (valueA < valueB) {
        return sortOrder === 'asc'
          ? -1
          : 1
      }

      if (valueA > valueB) {
        return sortOrder === 'asc'
          ? 1
          : -1
      }

      return 0
    })

    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------

    const total = result.length

    const totalPages = Math.ceil(
      total / pageSize,
    )

    const startIndex =
      (page - 1) * pageSize

    const endIndex =
      startIndex + pageSize

    const paginatedResult =
      result.slice(
        startIndex,
        endIndex,
      )

    return HttpResponse.json({
      success: true,
      data: paginatedResult,

      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  }),

  // --------------------------------------------------
  // GET /api/candidates/:id
  // --------------------------------------------------

  http.get(
    '/api/candidates/:id',
    ({ params, request }) => {
      const auth = requireAuth(request, 'candidate.read')

      if (!auth.ok) {
        return auth.response
      }

      const id = Number(params.id)

      const candidate = candidates.find(
        (item) => item.id === id,
      )

      if (!candidate) {
        return HttpResponse.json(
          {
            success: false,
            message: '找不到指定候選人',
            data: null,
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json({
        success: true,
        data: candidate,
      })
    },
  ),
  // --------------------------------------------------
  // POST /api/candidates
  // --------------------------------------------------

  http.post('/api/candidates', async ({ request }) => {
    const auth = requireAuth(request, 'candidate.create')

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as Partial<CreateCandidateInput>

    const missingField = findMissingField(body)

    if (missingField) {
      return HttpResponse.json(
        {
          success: false,
          message: `缺少必要欄位: ${missingField}`,
        },
        { status: 400 },
      )
    }

    const emailTaken = candidates.some(
      (item) => item.email.toLowerCase() === body.email!.toLowerCase(),
    )

    if (emailTaken) {
      return HttpResponse.json(
        {
          success: false,
          message: '此 Email 已存在於候選人資料中',
        },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()

    const nextId =
      candidates.length > 0
        ? Math.max(...candidates.map((item) => item.id)) + 1
        : 1

    const newCandidate: Candidate = {
      id: nextId,
      name: body.name as string,
      email: body.email as string,
      phone: body.phone as string,
      currentTitle: body.currentTitle as string,
      currentCompany: body.currentCompany as string,
      location: body.location as string,
      experience: body.experience as string,
      education: body.education as string,
      skills: body.skills as string[],
      source: body.source as Candidate['source'],
      status: body.status as Candidate['status'],
      resume: body.resume,
      createdAt: now,
      updatedAt: now,
    }

    candidates.push(newCandidate)

    pushAuditLog(auth.user, {
      action: 'create',
      targetType: 'candidate',
      targetId: newCandidate.id,
      targetName: newCandidate.name,
      details: '建立候選人',
    })

    return HttpResponse.json(
      {
        success: true,
        data: newCandidate,
      },
      { status: 201 },
    )
  }),

  // --------------------------------------------------
  // PUT /api/candidates/:id
  // --------------------------------------------------

  http.put('/api/candidates/:id', async ({ params, request }) => {
    const auth = requireAuth(request, 'candidate.update')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const index = candidates.findIndex((item) => item.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
          data: null,
        },
        { status: 404 },
      )
    }

    const body = (await request.json()) as Partial<UpdateCandidateInput>

    const missingField = findMissingField(body)

    if (missingField) {
      return HttpResponse.json(
        {
          success: false,
          message: `缺少必要欄位: ${missingField}`,
        },
        { status: 400 },
      )
    }

    const emailTaken = candidates.some(
      (item) =>
        item.id !== id &&
        item.email.toLowerCase() === body.email!.toLowerCase(),
    )

    if (emailTaken) {
      return HttpResponse.json(
        {
          success: false,
          message: '此 Email 已存在於候選人資料中',
        },
        { status: 409 },
      )
    }

    const existing = candidates[index]

    const updated: Candidate = {
      ...existing,
      name: body.name as string,
      email: body.email as string,
      phone: body.phone as string,
      currentTitle: body.currentTitle as string,
      currentCompany: body.currentCompany as string,
      location: body.location as string,
      experience: body.experience as string,
      education: body.education as string,
      skills: body.skills as string[],
      source: body.source as Candidate['source'],
      status: body.status as Candidate['status'],
      resume: body.resume ?? existing.resume,
      updatedAt: new Date().toISOString(),
    }

    candidates[index] = updated

    pushAuditLog(auth.user, {
      action: 'update',
      targetType: 'candidate',
      targetId: updated.id,
      targetName: updated.name,
      details:
        existing.status !== updated.status
          ? `狀態由 ${existing.status} 改為 ${updated.status}`
          : '更新候選人資料',
    })

    return HttpResponse.json({
      success: true,
      data: updated,
    })
  }),

  // --------------------------------------------------
  // DELETE /api/candidates/:id
  // --------------------------------------------------

  http.delete('/api/candidates/:id', ({ params, request }) => {
    const auth = requireAuth(request, 'candidate.delete')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const index = candidates.findIndex((item) => item.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
        },
        { status: 404 },
      )
    }

    const [removed] = candidates.splice(index, 1)

    pushAuditLog(auth.user, {
      action: 'delete',
      targetType: 'candidate',
      targetId: removed.id,
      targetName: removed.name,
      details: '刪除候選人',
    })

    return HttpResponse.json({
      success: true,
      message: '候選人已刪除',
    })
  }),

  // --------------------------------------------------
  // GET /api/candidates/:id/notes
  // --------------------------------------------------

  http.get('/api/candidates/:id/notes', ({ params, request }) => {
    const auth = requireAuth(request, 'candidate.read')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    if (!candidates.some((item) => item.id === id)) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
          data: [],
        },
        { status: 404 },
      )
    }

    const notes = candidateNotes
      .filter((note) => note.candidateId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

    return HttpResponse.json({
      success: true,
      data: notes,
    })
  }),

  // --------------------------------------------------
  // POST /api/candidates/:id/notes
  // --------------------------------------------------

  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    const auth = requireAuth(request, 'candidate.note')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    const candidate = candidates.find((item) => item.id === id)

    if (!candidate) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
        },
        { status: 404 },
      )
    }

    const body = (await request.json()) as Partial<CreateCandidateNoteInput>

    const content = body.content?.trim()

    if (!content) {
      return HttpResponse.json(
        {
          success: false,
          message: '請輸入備註內容',
        },
        { status: 400 },
      )
    }

    const note: CandidateNote = {
      id: nextCandidateNoteId(),
      candidateId: id,
      authorId: auth.user.id,
      authorName: auth.user.name,
      content,
      createdAt: new Date().toISOString(),
    }

    candidateNotes.push(note)

    pushAuditLog(auth.user, {
      action: 'create',
      targetType: 'candidate',
      targetId: candidate.id,
      targetName: candidate.name,
      details: '新增候選人備註',
    })

    return HttpResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 201 },
    )
  }),

  // --------------------------------------------------
  // DELETE /api/candidates/:id/notes/:noteId
  // --------------------------------------------------

  http.delete(
    '/api/candidates/:id/notes/:noteId',
    ({ params, request }) => {
      const auth = requireAuth(request, 'candidate.note')

      if (!auth.ok) {
        return auth.response
      }

      const id = Number(params.id)
      const noteId = Number(params.noteId)

      const index = candidateNotes.findIndex(
        (note) => note.id === noteId && note.candidateId === id,
      )

      if (index === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: '找不到指定備註',
          },
          { status: 404 },
        )
      }

      const note = candidateNotes[index]

      // 只有作者本人或 admin 可刪除備註
      if (
        note.authorId !== auth.user.id &&
        !auth.user.permissions.includes('*')
      ) {
        return HttpResponse.json(
          {
            success: false,
            message: '只能刪除自己建立的備註',
          },
          { status: 403 },
        )
      }

      candidateNotes.splice(index, 1)

      return HttpResponse.json({
        success: true,
        message: '備註已刪除',
      })
    },
  ),
  // --------------------------------------------------
  // GET /api/candidates/:id/history
  // --------------------------------------------------

  http.get('/api/candidates/:id/history', ({ params, request }) => {
    const auth = requireAuth(request, 'candidate.read')

    if (!auth.ok) {
      return auth.response
    }

    const id = Number(params.id)

    if (!candidates.some((item) => item.id === id)) {
      return HttpResponse.json(
        {
          success: false,
          message: '找不到指定候選人',
        },
        { status: 404 },
      )
    }

    const byNewest = (a: { updatedAt: string }, b: { updatedAt: string }) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()

    return HttpResponse.json({
      success: true,
      data: {
        applications: applications
          .filter((item) => item.candidateId === id)
          .map(resolveApplication)
          .sort(byNewest),
        interviews: interviews
          .filter((item) => item.candidateId === id)
          .map(resolveInterview)
          .sort(byNewest),
        offers: offers
          .filter((item) => item.candidateId === id)
          .map(resolveOffer)
          .sort(byNewest),
      },
    })
  }),
]
