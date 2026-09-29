import { http, HttpResponse } from 'msw'

import { jobs } from '../data/jobs'
import { pushAuditLog } from '../data/auditLogs'
import { requireAuth } from '../utils/auth'

import type {
  CreateJobInput,
  Job,
  UpdateJobInput,
} from '../../src/types/job'

export const jobHandlers = [
  // --------------------------------------------------
  // GET /api/jobs
  // --------------------------------------------------

  http.get('/api/jobs', ({ request }) => {
    const auth = requireAuth(request, 'job.read')

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

    const department =
      url.searchParams.get('department')

    const workType =
      url.searchParams.get('workType')

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

    let result = [...jobs]

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search) {
      result = result.filter((job) => {
        return (
          job.title
            .toLowerCase()
            .includes(search) ||
          job.description
            .toLowerCase()
            .includes(search)
        )
      })
    }

    // --------------------------------------------------
    // Filter: status
    // --------------------------------------------------

    if (status) {
      result = result.filter((job) => {
        return job.status === status
      })
    }

    // --------------------------------------------------
    // Filter: department
    // --------------------------------------------------

    if (department) {
      result = result.filter((job) => {
        return job.department === department
      })
    }

    // --------------------------------------------------
    // Filter: work type
    // --------------------------------------------------

    if (workType) {
      result = result.filter((job) => {
        return job.workType === workType
      })
    }

    // --------------------------------------------------
    // Sort
    // --------------------------------------------------

    result.sort((a, b) => {
      let valueA: string | number
      let valueB: string | number

      switch (sortBy) {
        case 'title':
          valueA = a.title
          valueB = b.title
          break

        case 'department':
          valueA = a.department
          valueB = b.department
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
  // GET /api/jobs/:id
  // --------------------------------------------------

  http.get(
    '/api/jobs/:id',
    ({ params, request }) => {
      const auth = requireAuth(request, 'job.read')

      if (!auth.ok) {
        return auth.response
      }

      const id = Number(params.id)

      const job = jobs.find(
        (item) => item.id === id,
      )

      if (!job) {
        return HttpResponse.json(
          {
            success: false,
            message: '找不到指定職缺',
            data: null,
          },
          {
            status: 404,
          },
        )
      }

      return HttpResponse.json({
        success: true,
        data: job,
      })
    },
  ),

  // --------------------------------------------------
  // POST /api/jobs
  // --------------------------------------------------

  http.post(
    '/api/jobs',
    async ({ request }) => {
      const auth = requireAuth(request, 'job.create')

      if (!auth.ok) {
        return auth.response
      }

      const body =
        (await request.json()) as Partial<CreateJobInput>

      const requiredFields: Array<
        keyof CreateJobInput
      > = [
        'title',
        'description',
        'department',
        'location',
        'workType',
        'salaryMin',
        'salaryMax',
        'experience',
        'education',
        'requiredSkills',
        'status',
      ]

      const missingField =
        requiredFields.find((field) => {
          return (
            body[field] === undefined ||
            body[field] === null ||
            body[field] === ''
          )
        })

      if (missingField) {
        return HttpResponse.json(
          {
            success: false,
            message: `缺少必要欄位: ${missingField}`,
          },
          {
            status: 400,
          },
        )
      }

      const now =
        new Date().toISOString()

      const nextId =
        jobs.length > 0
          ? Math.max(
              ...jobs.map(
                (job) => job.id,
              ),
            ) + 1
          : 1

      const newJob: Job = {
        id: nextId,
        title: body.title as string,
        description:
          body.description as string,
        department:
          body.department as string,
        location:
          body.location as string,
        workType:
          body.workType as CreateJobInput['workType'],
        salaryMin:
          body.salaryMin as number,
        salaryMax:
          body.salaryMax as number,
        experience:
          body.experience as string,
        education:
          body.education as string,
        requiredSkills:
          body.requiredSkills as string[],
        status:
          body.status as CreateJobInput['status'],
        createdAt: now,
        updatedAt: now,
      }

      jobs.push(newJob)

      pushAuditLog(auth.user, {
        action: 'create',
        targetType: 'job',
        targetId: newJob.id,
        targetName: newJob.title,
        details: `建立職缺（${newJob.department}）`,
      })

      return HttpResponse.json(
        {
          success: true,
          data: newJob,
        },
        {
          status: 201,
        },
      )
    },
  ),

  // --------------------------------------------------
  // PUT /api/jobs/:id
  // --------------------------------------------------

  http.put(
    '/api/jobs/:id',
    async ({ params, request }) => {
      const auth = requireAuth(request, 'job.update')

      if (!auth.ok) {
        return auth.response
      }

      const id = Number(params.id)

      const jobIndex = jobs.findIndex(
        (item) => item.id === id,
      )

      if (jobIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: '找不到指定職缺',
            data: null,
          },
          {
            status: 404,
          },
        )
      }

      const body =
        (await request.json()) as Partial<UpdateJobInput>

      const requiredFields: Array<
        keyof UpdateJobInput
      > = [
        'title',
        'description',
        'department',
        'location',
        'workType',
        'salaryMin',
        'salaryMax',
        'experience',
        'education',
        'requiredSkills',
        'status',
      ]

      const missingField =
        requiredFields.find((field) => {
          return (
            body[field] === undefined ||
            body[field] === null ||
            body[field] === ''
          )
        })

      if (missingField) {
        return HttpResponse.json(
          {
            success: false,
            message: `缺少必要欄位: ${missingField}`,
          },
          {
            status: 400,
          },
        )
      }

      const existingJob = jobs[jobIndex]

      const updatedJob: Job = {
        ...existingJob,
        title: body.title as string,
        description:
          body.description as string,
        department:
          body.department as string,
        location:
          body.location as string,
        workType:
          body.workType as UpdateJobInput['workType'],
        salaryMin:
          body.salaryMin as number,
        salaryMax:
          body.salaryMax as number,
        experience:
          body.experience as string,
        education:
          body.education as string,
        requiredSkills:
          body.requiredSkills as string[],
        status:
          body.status as UpdateJobInput['status'],
        updatedAt: new Date().toISOString(),
      }

      jobs[jobIndex] = updatedJob

      pushAuditLog(auth.user, {
        action: 'update',
        targetType: 'job',
        targetId: updatedJob.id,
        targetName: updatedJob.title,
        details:
          existingJob.status !== updatedJob.status
            ? `狀態由 ${existingJob.status} 改為 ${updatedJob.status}`
            : '更新職缺資料',
      })

      return HttpResponse.json({
        success: true,
        data: updatedJob,
      })
    },
  ),

  // --------------------------------------------------
  // DELETE /api/jobs/:id
  // --------------------------------------------------

  http.delete(
    '/api/jobs/:id',
    ({ params, request }) => {
      const auth = requireAuth(request, 'job.delete')

      if (!auth.ok) {
        return auth.response
      }

      const id = Number(params.id)

      const jobIndex = jobs.findIndex(
        (item) => item.id === id,
      )

      if (jobIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: '找不到指定職缺',
          },
          {
            status: 404,
          },
        )
      }

      const [removedJob] = jobs.splice(jobIndex, 1)

      pushAuditLog(auth.user, {
        action: 'delete',
        targetType: 'job',
        targetId: removedJob.id,
        targetName: removedJob.title,
        details: '刪除職缺',
      })

      return HttpResponse.json({
        success: true,
        message: '職缺已刪除',
      })
    },
  ),
]