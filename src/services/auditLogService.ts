import { http } from './http'

import type {
  AuditLogListResponse,
  AuditLogQuery,
} from '../types/auditLog'

export async function getAuditLogs(
  query: AuditLogQuery = {},
): Promise<AuditLogListResponse> {
  const response = await http.get<AuditLogListResponse>('/audit-logs', {
    params: query,
  })

  return response.data
}
