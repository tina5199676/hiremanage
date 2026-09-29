import { applicationHandlers } from './applications'
import { auditLogHandlers } from './auditLogs'
import { authHandlers } from './auth'
import { candidateHandlers } from './candidates'
import { dashboardHandlers } from './dashboard'
import { interviewHandlers } from './interviews'
import { jobHandlers } from './jobs'
import { notificationHandlers } from './notifications'
import { offerHandlers } from './offers'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...jobHandlers,
  ...candidateHandlers,
  ...applicationHandlers,
  ...interviewHandlers,
  ...offerHandlers,
  ...notificationHandlers,
  ...auditLogHandlers,
]
