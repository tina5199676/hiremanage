import type {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  SortOrder,
} from './common'

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export type OfferSortBy = 'createdAt' | 'startDate' | 'expirationDate' | 'salary'

export interface Offer {
  id: number
  applicationId: number
  candidateId: number
  jobId: number
  /** 由 Mock API 解析 */
  candidateName: string
  /** 由 Mock API 解析 */
  jobTitle: string
  /** 月薪 */
  salary: number
  /** YYYY-MM-DD */
  startDate: string
  /** YYYY-MM-DD */
  expirationDate: string
  benefits: string[]
  message: string
  status: OfferStatus
  createdAt: string
  updatedAt: string
}

export interface OfferQuery {
  search?: string
  status?: OfferStatus
  candidateId?: number
  page?: number
  pageSize?: number
  sortBy?: OfferSortBy
  sortOrder?: SortOrder
}

export interface CreateOfferInput {
  applicationId: number
  salary: number
  startDate: string
  expirationDate: string
  benefits: string[]
  message: string
  status: OfferStatus
}

export type UpdateOfferInput = Omit<CreateOfferInput, 'applicationId'>

export interface UpdateOfferStatusInput {
  status: OfferStatus
}

export type OfferListResponse = ApiListResponse<Offer>

export type OfferDetailResponse = ApiItemResponse<Offer>

export interface CreateOfferResponse {
  success: boolean
  data: Offer
  message?: string
}

export type UpdateOfferResponse = ApiItemResponse<Offer>

export type DeleteOfferResponse = ApiMessageResponse
