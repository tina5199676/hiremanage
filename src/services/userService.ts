import { http } from './http'

import type { UserListResponse } from '../types/auth'

export async function getUsers(): Promise<UserListResponse> {
  const response = await http.get<UserListResponse>('/users')

  return response.data
}
