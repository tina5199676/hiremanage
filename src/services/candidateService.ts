import axios from 'axios'

import type {
  CandidateDetailResponse,
  CandidateListResponse,
  CandidateQuery,
} from '../types/candidate'

export async function getCandidates(
  query: CandidateQuery = {},
): Promise<CandidateListResponse> {
  const response =
    await axios.get<CandidateListResponse>(
      '/api/candidates',
      {
        params: query,
      },
    )

  return response.data
}

export async function getCandidateById(
  id: number,
): Promise<CandidateDetailResponse> {
  const response =
    await axios.get<CandidateDetailResponse>(
      `/api/candidates/${id}`,
    )

  return response.data
}
