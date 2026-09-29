import axios from 'axios'

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
  const response =
    await axios.get<JobListResponse>(
      '/api/jobs',
      {
        params: query,
      },
    )

  return response.data
}

export async function createJob(
  payload: CreateJobInput,
): Promise<CreateJobResponse> {
  const response =
    await axios.post<CreateJobResponse>(
      '/api/jobs',
      payload,
    )

  return response.data
}

export async function getJobById(
  id: number,
): Promise<JobDetailResponse> {
  const response =
    await axios.get<JobDetailResponse>(
      `/api/jobs/${id}`,
    )

  return response.data
}

export async function updateJob(
  id: number,
  payload: UpdateJobInput,
): Promise<UpdateJobResponse> {
  const response =
    await axios.put<UpdateJobResponse>(
      `/api/jobs/${id}`,
      payload,
    )

  return response.data
}

export async function deleteJob(
  id: number,
): Promise<DeleteJobResponse> {
  const response =
    await axios.delete<DeleteJobResponse>(
      `/api/jobs/${id}`,
    )

  return response.data
}