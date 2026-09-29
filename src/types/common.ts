export type SortOrder = 'asc' | 'desc'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export interface ApiItemResponse<T> {
  success: boolean
  data: T | null
  message?: string
}

export interface ApiMessageResponse {
  success: boolean
  message?: string
}

export interface ApiErrorBody {
  success: false
  message: string
}
