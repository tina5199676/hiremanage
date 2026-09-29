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

export interface CandidateResume {
  /** 履歷摘要（虛構資料） */
  summary: string
  fileName: string
  uploadedAt: string
}

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
  resume?: CandidateResume
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

export interface CreateCandidateInput {
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
  resume?: CandidateResume
}

export type UpdateCandidateInput = CreateCandidateInput

export interface CreateCandidateResponse {
  success: boolean
  data: Candidate
  message?: string
}

export interface UpdateCandidateResponse {
  success: boolean
  data: Candidate | null
  message?: string
}

export interface DeleteCandidateResponse {
  success: boolean
  message?: string
}

// --------------------------------------------------
// Notes
// --------------------------------------------------

export interface CandidateNote {
  id: number
  candidateId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

export interface CreateCandidateNoteInput {
  content: string
}

export interface CandidateNoteListResponse {
  success: boolean
  data: CandidateNote[]
}

export interface CreateCandidateNoteResponse {
  success: boolean
  data: CandidateNote
  message?: string
}

export interface DeleteCandidateNoteResponse {
  success: boolean
  message?: string
}
