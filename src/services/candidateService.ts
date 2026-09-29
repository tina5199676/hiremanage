import { http } from './http'

import type {
  CandidateDetailResponse,
  CandidateHistoryResponse,
  CandidateListResponse,
  CandidateNoteListResponse,
  CandidateQuery,
  CreateCandidateInput,
  CreateCandidateNoteInput,
  CreateCandidateNoteResponse,
  CreateCandidateResponse,
  DeleteCandidateNoteResponse,
  DeleteCandidateResponse,
  UpdateCandidateInput,
  UpdateCandidateResponse,
} from '../types/candidate'

export async function getCandidates(
  query: CandidateQuery = {},
): Promise<CandidateListResponse> {
  const response = await http.get<CandidateListResponse>('/candidates', {
    params: query,
  })

  return response.data
}

export async function getCandidateById(
  id: number,
): Promise<CandidateDetailResponse> {
  const response = await http.get<CandidateDetailResponse>(
    `/candidates/${id}`,
  )

  return response.data
}

export async function createCandidate(
  payload: CreateCandidateInput,
): Promise<CreateCandidateResponse> {
  const response = await http.post<CreateCandidateResponse>(
    '/candidates',
    payload,
  )

  return response.data
}

export async function updateCandidate(
  id: number,
  payload: UpdateCandidateInput,
): Promise<UpdateCandidateResponse> {
  const response = await http.put<UpdateCandidateResponse>(
    `/candidates/${id}`,
    payload,
  )

  return response.data
}

export async function deleteCandidate(
  id: number,
): Promise<DeleteCandidateResponse> {
  const response = await http.delete<DeleteCandidateResponse>(
    `/candidates/${id}`,
  )

  return response.data
}

// --------------------------------------------------
// Notes
// --------------------------------------------------

export async function getCandidateNotes(
  candidateId: number,
): Promise<CandidateNoteListResponse> {
  const response = await http.get<CandidateNoteListResponse>(
    `/candidates/${candidateId}/notes`,
  )

  return response.data
}

export async function createCandidateNote(
  candidateId: number,
  payload: CreateCandidateNoteInput,
): Promise<CreateCandidateNoteResponse> {
  const response = await http.post<CreateCandidateNoteResponse>(
    `/candidates/${candidateId}/notes`,
    payload,
  )

  return response.data
}

export async function deleteCandidateNote(
  candidateId: number,
  noteId: number,
): Promise<DeleteCandidateNoteResponse> {
  const response = await http.delete<DeleteCandidateNoteResponse>(
    `/candidates/${candidateId}/notes/${noteId}`,
  )

  return response.data
}

// --------------------------------------------------
// History
// --------------------------------------------------

export async function getCandidateHistory(
  candidateId: number,
): Promise<CandidateHistoryResponse> {
  const response = await http.get<CandidateHistoryResponse>(
    `/candidates/${candidateId}/history`,
  )

  return response.data
}
