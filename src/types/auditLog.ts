import type { ApiListResponse } from './common'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status-change'
  | 'feedback'
  | 'login'
  | 'logout'

export type AuditTargetType =
  | 'job'
  | 'candidate'
  | 'application'
  | 'interview'
  | 'offer'
  | 'user'

export interface AuditLog {
  id: number
  actorId: number
  actorName: string
  action: AuditAction
  targetType: AuditTargetType
  targetId: number | null
  targetName: string
  details: string
  createdAt: string
}

export interface AuditLogQuery {
  search?: string
  action?: AuditAction
  targetType?: AuditTargetType
  actorId?: number
  page?: number
  pageSize?: number
}

export type AuditLogListResponse = ApiListResponse<AuditLog>
