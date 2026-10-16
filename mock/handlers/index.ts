import { applicationHandlers } from './applications'
import { auditLogHandlers } from './auditLogs'
import { authHandlers } from './auth'
import { candidateHandlers } from './candidates'
import { dashboardHandlers } from './dashboard'
import { interviewHandlers } from './interviews'
import { jobHandlers } from './jobs'
import { notificationHandlers } from './notifications'
import { offerHandlers } from './offers'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...dashboardHandlers,
  ...jobHandlers,
  ...candidateHandlers,
  ...applicationHandlers,
  ...interviewHandlers,
  ...offerHandlers,
  ...notificationHandlers,
  ...auditLogHandlers,
]
