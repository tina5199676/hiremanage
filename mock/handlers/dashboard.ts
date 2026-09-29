import { http, HttpResponse } from 'msw'

import { applications, resolveApplication } from '../data/applications'
import { candidates } from '../data/candidates'
import { interviews } from '../data/interviews'
import { jobs } from '../data/jobs'
import { offers } from '../data/offers'
import { requireAuth } from '../utils/auth'

import type { ApplicationStatus } from '../../src/types/application'
import type {
  DashboardData,
  FunnelStep,
  TrendPoint,
} from '../../src/types/dashboard'

const FUNNEL_ORDER: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
]

const TREND_DAYS = 30

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildTrend(now: Date): TrendPoint[] {
  const counts = new Map<string, number>()

  for (let offset = TREND_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(now)

    day.setUTCDate(day.getUTCDate() - offset)

    counts.set(toDateKey(day), 0)
  }

  applications.forEach((item) => {
    const key = item.appliedAt.slice(0, 10)

    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  })

  return Array.from(counts.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}

function buildFunnel(): FunnelStep[] {
  return FUNNEL_ORDER.map((status, index) => ({
    status,
    count: applications.filter((item) => {
      const position = FUNNEL_ORDER.indexOf(item.status)

      return position >= index
    }).length,
  }))
}

export const dashboardHandlers = [
  // --------------------------------------------------
  // GET /api/dashboard
  // --------------------------------------------------

  http.get('/api/dashboard', ({ request }) => {
    const auth = requireAuth(request, 'dashboard.read')

    if (!auth.ok) {
      return auth.response
    }

    const now = new Date()

    const monthKey = now.toISOString().slice(0, 7)

    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay())
    const weekStartKey = toDateKey(weekStart)

    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
    const weekEndKey = toDateKey(weekEnd)

    const data: DashboardData = {
      stats: {
        openJobs: jobs.filter((job) => job.status === 'open').length,
        totalJobs: jobs.length,
        candidates: candidates.length,
        activeCandidates: candidates.filter(
          (candidate) => candidate.status === 'active',
        ).length,
        applications: applications.length,
        applicationsThisMonth: applications.filter((item) =>
          item.appliedAt.startsWith(monthKey),
        ).length,
        scheduledInterviews: interviews.filter(
          (item) => item.status === 'scheduled',
        ).length,
        interviewsThisWeek: interviews.filter(
          (item) =>
            item.status === 'scheduled' &&
            item.date >= weekStartKey &&
            item.date <= weekEndKey,
        ).length,
        offers: offers.length,
        pendingOffers: offers.filter((item) => item.status === 'sent').length,
      },
      trend: buildTrend(now),
      funnel: buildFunnel(),
      recentApplications: [...applications]
        .sort(
          (a, b) =>
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
        )
        .slice(0, 5)
        .map(resolveApplication),
    }

    return HttpResponse.json({
      success: true,
      data,
    })
  }),
]
