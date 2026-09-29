import { auditLogHandlers } from './auditLogs'
import { authHandlers } from './auth'
import { candidateHandlers } from './candidates'
import { jobHandlers } from './jobs'
import { notificationHandlers } from './notifications'

export const handlers = [
  ...authHandlers,
  ...jobHandlers,
  ...candidateHandlers,
  ...notificationHandlers,
  ...auditLogHandlers,
]
