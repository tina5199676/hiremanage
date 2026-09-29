import type {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  SortOrder,
} from './common'

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'

export type ApplicationSortBy = 'appliedAt' | 'updatedAt' | 'candidateName'

export interface Application {
  id: number
  candidateId: number
  jobId: number
  /** 由 Mock API 依 candidateId 解析，方便 UI 顯示 */
  candidateName: string
  /** 由 Mock API 依 jobId 解析，方便 UI 顯示 */
  jobTitle: string
  jobDepartment: string
  status: ApplicationStatus
  /** 應徵來源備註或 HR 筆記 */
  note: string
  appliedAt: string
  updatedAt: string
}

export interface ApplicationQuery {
  search?: string
  status?: ApplicationStatus
  jobId?: number
  candidateId?: number
  page?: number
  pageSize?: number
  sortBy?: ApplicationSortBy
  sortOrder?: SortOrder
}

export interface CreateApplicationInput {
  candidateId: number
  jobId: number
  status: ApplicationStatus
  note: string
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus
}

export type ApplicationListResponse = ApiListResponse<Application>

export type ApplicationDetailResponse = ApiItemResponse<Application>

export interface CreateApplicationResponse {
  success: boolean
  data: Application
  message?: string
}

export type UpdateApplicationResponse = ApiItemResponse<Application>

export type DeleteApplicationResponse = ApiMessageResponse

/** Kanban 需要一次取得所有 Application，依 status 分組 */
export interface ApplicationBoardResponse {
  success: boolean
  data: Record<ApplicationStatus, Application[]>
}
