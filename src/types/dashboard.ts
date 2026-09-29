import type { Application, ApplicationStatus } from './application'

export interface DashboardStats {
  openJobs: number
  totalJobs: number
  candidates: number
  activeCandidates: number
  applications: number
  applicationsThisMonth: number
  scheduledInterviews: number
  interviewsThisWeek: number
  offers: number
  pendingOffers: number
}

export interface TrendPoint {
  /** YYYY-MM-DD */
  date: string
  count: number
}

export interface FunnelStep {
  status: ApplicationStatus
  /** 到達此階段（含之後階段）的應徵數 */
  count: number
}

export interface DashboardData {
  stats: DashboardStats
  /** 最近 30 天每日應徵數 */
  trend: TrendPoint[]
  funnel: FunnelStep[]
  recentApplications: Application[]
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
}
