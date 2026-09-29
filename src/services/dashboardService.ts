import { http } from './http'

import type { DashboardResponse } from '../types/dashboard'

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await http.get<DashboardResponse>('/dashboard')

  return response.data
}
