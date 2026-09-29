import { http } from './http'

import type { ApplicationListResponse } from '../types/application'
import type {
  CreateOfferInput,
  CreateOfferResponse,
  DeleteOfferResponse,
  OfferDetailResponse,
  OfferListResponse,
  OfferQuery,
  OfferStatus,
  UpdateOfferInput,
  UpdateOfferResponse,
} from '../types/offer'

export async function getOffers(
  query: OfferQuery = {},
): Promise<OfferListResponse> {
  const response = await http.get<OfferListResponse>('/offers', {
    params: query,
  })

  return response.data
}

export async function getOfferById(
  id: number,
): Promise<OfferDetailResponse> {
  const response = await http.get<OfferDetailResponse>(`/offers/${id}`)

  return response.data
}

export async function createOffer(
  payload: CreateOfferInput,
): Promise<CreateOfferResponse> {
  const response = await http.post<CreateOfferResponse>('/offers', payload)

  return response.data
}

export async function updateOffer(
  id: number,
  payload: UpdateOfferInput,
): Promise<UpdateOfferResponse> {
  const response = await http.put<UpdateOfferResponse>(
    `/offers/${id}`,
    payload,
  )

  return response.data
}

export async function updateOfferStatus(
  id: number,
  status: OfferStatus,
): Promise<UpdateOfferResponse> {
  const response = await http.patch<UpdateOfferResponse>(
    `/offers/${id}/status`,
    { status },
  )

  return response.data
}

export async function deleteOffer(
  id: number,
): Promise<DeleteOfferResponse> {
  const response = await http.delete<DeleteOfferResponse>(`/offers/${id}`)

  return response.data
}

/**
 * 取得可建立 Offer 的應徵紀錄選項（供表單下拉選單使用）。
 */
export async function getApplicationOptions(): Promise<ApplicationListResponse> {
  const response = await http.get<ApplicationListResponse>('/applications', {
    params: { pageSize: 100 },
  })

  return response.data
}
