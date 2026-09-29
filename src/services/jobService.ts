import { http } from './http'

import type {
  CreateJobInput,
  CreateJobResponse,
  DeleteJobResponse,
  JobDetailResponse,
  JobListResponse,
  JobQuery,
  UpdateJobInput,
  UpdateJobResponse,
} from '../types/job'

export async function getJobs(
  query: JobQuery = {},
): Promise<JobListResponse> {
  const response = await http.get<JobListResponse>('/jobs', {
    params: query,
  })

  return response.data
}

export async function getJobById(
  id: number,
): Promise<JobDetailResponse> {
  const response = await http.get<JobDetailResponse>(`/jobs/${id}`)

  return response.data
}

export async function createJob(
  payload: CreateJobInput,
): Promise<CreateJobResponse> {
  const response = await http.post<CreateJobResponse>('/jobs', payload)

  return response.data
}

export async function updateJob(
  id: number,
  payload: UpdateJobInput,
): Promise<UpdateJobResponse> {
  const response = await http.put<UpdateJobResponse>(
    `/jobs/${id}`,
    payload,
  )

  return response.data
}

export async function deleteJob(
  id: number,
): Promise<DeleteJobResponse> {
  const response = await http.delete<DeleteJobResponse>(`/jobs/${id}`)

  return response.data
}
