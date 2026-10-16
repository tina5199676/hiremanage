import { http } from './http'

import type { ApplicationListResponse } from '../types/application'
import type {
  CreateInterviewInput,
  CreateInterviewResponse,
  DeleteInterviewResponse,
  InterviewDetailResponse,
  InterviewListResponse,
  InterviewQuery,
  SubmitFeedbackInput,
  SubmitFeedbackResponse,
  UpdateInterviewInput,
  UpdateInterviewResponse,
} from '../types/interview'

export async function getInterviews(
  query: InterviewQuery = {},
): Promise<InterviewListResponse> {
  const response = await http.get<InterviewListResponse>('/interviews', {
    params: query,
  })

  return response.data
}

export async function getInterviewById(
  id: number,
): Promise<InterviewDetailResponse> {
  const response = await http.get<InterviewDetailResponse>(
    `/interviews/${id}`,
  )

  return response.data
}

export async function createInterview(
  payload: CreateInterviewInput,
): Promise<CreateInterviewResponse> {
  const response = await http.post<CreateInterviewResponse>(
    '/interviews',
    payload,
  )

  return response.data
}

export async function updateInterview(
  id: number,
  payload: UpdateInterviewInput,
): Promise<UpdateInterviewResponse> {
  const response = await http.put<UpdateInterviewResponse>(
    `/interviews/${id}`,
    payload,
  )

  return response.data
}

export async function deleteInterview(
  id: number,
): Promise<DeleteInterviewResponse> {
  const response = await http.delete<DeleteInterviewResponse>(
    `/interviews/${id}`,
  )

  return response.data
}

export async function submitInterviewFeedback(
  id: number,
  payload: SubmitFeedbackInput,
): Promise<SubmitFeedbackResponse> {
  const response = await http.post<SubmitFeedbackResponse>(
    `/interviews/${id}/feedback`,
    payload,
  )

  return response.data
}

/**
 * 取得可安排面試的應徵紀錄選項（供表單下拉選單使用）。
 */
export async function getApplicationOptions(): Promise<ApplicationListResponse> {
  const response = await http.get<ApplicationListResponse>('/applications', {
    params: { pageSize: 100 },
  })

  return response.data
}
