export type CandidateStatus =
  | 'active'
  | 'inactive'
  | 'hired'

export type CandidateSource =
  | 'referral'
  | 'linkedin'
  | 'job-board'
  | 'career-site'
  | 'other'

export type CandidateSortBy =
  | 'name'
  | 'createdAt'
  | 'updatedAt'

export type SortOrder = 'asc' | 'desc'

export interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  currentTitle: string
  currentCompany: string
  location: string
  experience: string
  education: string
  skills: string[]
  source: CandidateSource
  status: CandidateStatus
  createdAt: string
  updatedAt: string
}

export interface CandidateQuery {
  search?: string
  status?: CandidateStatus
  source?: CandidateSource
  page?: number
  pageSize?: number
  sortBy?: CandidateSortBy
  sortOrder?: SortOrder
}

export interface CandidatePaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface CandidateListResponse {
  success: boolean
  data: Candidate[]
  meta: CandidatePaginationMeta
}

export interface CandidateDetailResponse {
  success: boolean
  data: Candidate | null
  message?: string
}
