import type { AuditLog } from '../../src/types/auditLog'
import type { User } from '../../src/types/auth'

export const auditLogs: AuditLog[] = [
  {
    id: 1,
    actorId: 2,
    actorName: '張雅婷',
    action: 'create',
    targetType: 'job',
    targetId: 1,
    targetName: 'Frontend Engineer',
    details: '建立職缺',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 2,
    actorId: 2,
    actorName: '張雅婷',
    action: 'update',
    targetType: 'job',
    targetId: 1,
    targetName: 'Frontend Engineer',
    details: '狀態由 draft 改為 open',
    createdAt: '2026-09-20T09:00:00Z',
  },
  {
    id: 3,
    actorId: 2,
    actorName: '張雅婷',
    action: 'status-change',
    targetType: 'application',
    targetId: 1,
    targetName: '陳柏宇 - Frontend Engineer',
    details: '狀態由 screening 改為 interview',
    createdAt: '2026-09-25T06:30:00Z',
  },
  {
    id: 4,
    actorId: 1,
    actorName: '王建宏',
    action: 'create',
    targetType: 'user',
    targetId: 3,
    targetName: '李冠廷',
    details: '建立 Hiring Manager 帳號',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 5,
    actorId: 3,
    actorName: '李冠廷',
    action: 'feedback',
    targetType: 'interview',
    targetId: 2,
    targetName: '林詩涵 - Backend Engineer',
    details: '提交面試回饋，評分 4 / 5',
    createdAt: '2026-09-27T09:00:00Z',
  },
]

let nextAuditLogId = auditLogs.length + 1

export function pushAuditLog(
  actor: User,
  input: Omit<AuditLog, 'id' | 'actorId' | 'actorName' | 'createdAt'>,
): AuditLog {
  const log: AuditLog = {
    ...input,
    id: nextAuditLogId,
    actorId: actor.id,
    actorName: actor.name,
    createdAt: new Date().toISOString(),
  }

  nextAuditLogId += 1

  auditLogs.unshift(log)

  return log
}
