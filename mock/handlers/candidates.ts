import { http, HttpResponse } from 'msw'

import { candidates } from '../data/candidates'

export const candidateHandlers = [
  // --------------------------------------------------
  // GET /api/candidates
  // --------------------------------------------------

  http.get('/api/candidates', ({ request }) => {
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
    ({ params }) => {
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
]
