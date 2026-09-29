export type JobStatus = 'draft' | 'open' | 'closed'

export type WorkType = 'onsite' | 'remote' | 'hybrid'

export type JobSortBy =
  | 'title'
  | 'department'
  | 'createdAt'
  | 'updatedAt'

export type SortOrder = 'asc' | 'desc'

export interface Job {
  id: number
  title: string
  description: string
  department: string
  location: string
  workType: WorkType
  salaryMin: number
  salaryMax: number
  experience: string
  education: string
  requiredSkills: string[]
  status: JobStatus
  createdAt: string
  updatedAt: string
}

export interface JobQuery {
  search?: string
  status?: JobStatus
  department?: string
  workType?: WorkType
  page?: number
  pageSize?: number
  sortBy?: JobSortBy
  sortOrder?: SortOrder
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface JobListResponse {
  success: boolean
  data: Job[]
  meta: PaginationMeta
}

export interface JobDetailResponse {
  success: boolean
  data: Job | null
  message?: string
}

export interface CreateJobInput {
  title: string
  description: string
  department: string
  location: string
  workType: WorkType
  salaryMin: number
  salaryMax: number
  experience: string
  education: string
  requiredSkills: string[]
  status: JobStatus
}

export interface CreateJobResponse {
  success: boolean
  data: Job
  message?: string
}

export type UpdateJobInput = CreateJobInput

export interface UpdateJobResponse {
  success: boolean
  data: Job | null
  message?: string
}

export interface DeleteJobResponse {
  success: boolean
  message?: string
}