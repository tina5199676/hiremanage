import { http } from './http'

import type {
  ApplicationBoardResponse,
  ApplicationDetailResponse,
  ApplicationListResponse,
  ApplicationQuery,
  CreateApplicationInput,
  CreateApplicationResponse,
  DeleteApplicationResponse,
  UpdateApplicationResponse,
  UpdateApplicationStatusInput,
} from '../types/application'

export type UpdateApplicationInput = Pick<
  CreateApplicationInput,
  'status' | 'note'
>

export async function getApplications(
  query: ApplicationQuery = {},
): Promise<ApplicationListResponse> {
  const response = await http.get<ApplicationListResponse>(
    '/applications',
    { params: query },
  )

  return response.data
}

export async function getApplicationBoard(): Promise<ApplicationBoardResponse> {
  const response = await http.get<ApplicationBoardResponse>(
    '/applications/board',
  )

  return response.data
}

export async function getApplicationById(
  id: number,
): Promise<ApplicationDetailResponse> {
  const response = await http.get<ApplicationDetailResponse>(
    `/applications/${id}`,
  )

  return response.data
}

export async function createApplication(
  payload: CreateApplicationInput,
): Promise<CreateApplicationResponse> {
  const response = await http.post<CreateApplicationResponse>(
    '/applications',
    payload,
  )

  return response.data
}

export async function updateApplicationStatus(
  id: number,
  payload: UpdateApplicationStatusInput,
): Promise<UpdateApplicationResponse> {
  const response = await http.patch<UpdateApplicationResponse>(
    `/applications/${id}/status`,
    payload,
  )

  return response.data
}

export async function updateApplication(
  id: number,
  payload: UpdateApplicationInput,
): Promise<UpdateApplicationResponse> {
  const response = await http.put<UpdateApplicationResponse>(
    `/applications/${id}`,
    payload,
  )

  return response.data
}

export async function deleteApplication(
  id: number,
): Promise<DeleteApplicationResponse> {
  const response = await http.delete<DeleteApplicationResponse>(
    `/applications/${id}`,
  )

  return response.data
}
