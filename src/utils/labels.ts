import type { BadgeTone } from '../components/StatusBadge.vue'
import type {
  CandidateSource,
  CandidateStatus,
} from '../types/candidate'
import type { JobStatus, WorkType } from '../types/job'
import type { ApplicationStatus } from '../types/application'
import type { AuditAction, AuditTargetType } from '../types/auditLog'
import type {
  InterviewMode,
  InterviewStage,
  InterviewStatus,
} from '../types/interview'
import type { NotificationType } from '../types/notification'
import type { OfferStatus } from '../types/offer'

// --------------------------------------------------
// Job
// --------------------------------------------------

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: '草稿',
  open: '開放中',
  closed: '已關閉',
}

export const JOB_STATUS_TONES: Record<JobStatus, BadgeTone> = {
  draft: 'warning',
  open: 'success',
  closed: 'neutral',
}

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

// --------------------------------------------------
// Candidate
// --------------------------------------------------

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  active: '在職應徵中',
  inactive: '未在聯繫',
  hired: '已錄取',
}

export const CANDIDATE_STATUS_TONES: Record<CandidateStatus, BadgeTone> = {
  active: 'success',
  inactive: 'neutral',
  hired: 'info',
}

export const CANDIDATE_SOURCE_LABELS: Record<CandidateSource, string> = {
  referral: 'Referral',
  linkedin: 'LinkedIn',
  'job-board': 'Job Board',
  'career-site': 'Career Site',
  other: 'Other',
}

/**
 * 將 Record 轉為 select option 陣列，可選擇加入「全部」選項。
 */
export function toOptions<T extends string>(
  labels: Record<T, string>,
  allLabel?: string,
): Array<{ label: string; value: T | '' }> {
  const options: Array<{ label: string; value: T | '' }> = (
    Object.keys(labels) as T[]
  ).map((value) => ({ label: labels[value], value }))

  if (allLabel) {
    options.unshift({ label: allLabel, value: '' })
  }

  return options
}

// --------------------------------------------------
// Application
// --------------------------------------------------


/** Kanban 欄位順序（rejected 放最後） */
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  applied: 'neutral',
  screening: 'info',
  interview: 'purple',
  offer: 'warning',
  hired: 'success',
  rejected: 'danger',
}

// --------------------------------------------------
// Interview
// --------------------------------------------------

export const INTERVIEW_STAGE_LABELS: Record<InterviewStage, string> = {
  'phone-screen': '電話初篩',
  technical: '技術面試',
  'hiring-manager': '主管面試',
  final: '最終面試',
}

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  onsite: '現場',
  video: '視訊',
  phone: '電話',
}

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: '已排定',
  completed: '已完成',
  cancelled: '已取消',
}

export const INTERVIEW_STATUS_TONES: Record<InterviewStatus, BadgeTone> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'neutral',
}

// --------------------------------------------------
// Offer
// --------------------------------------------------

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: '草稿',
  sent: '已送出',
  accepted: '已接受',
  rejected: '已拒絕',
}

export const OFFER_STATUS_TONES: Record<OfferStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
}

// --------------------------------------------------
// Notification
// --------------------------------------------------

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  interview_scheduled: '面試',
  application_updated: '應徵',
  offer_accepted: 'Offer',
  offer_rejected: 'Offer',
  system: '系統',
}

export const NOTIFICATION_TYPE_TONES: Record<NotificationType, BadgeTone> = {
  interview_scheduled: 'purple',
  application_updated: 'info',
  offer_accepted: 'success',
  offer_rejected: 'danger',
  system: 'neutral',
}

// --------------------------------------------------
// Audit log
// --------------------------------------------------

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: '建立',
  update: '更新',
  delete: '刪除',
  'status-change': '狀態變更',
  feedback: '面試回饋',
  login: '登入',
  logout: '登出',
}

export const AUDIT_ACTION_TONES: Record<AuditAction, BadgeTone> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  'status-change': 'warning',
  feedback: 'purple',
  login: 'neutral',
  logout: 'neutral',
}

export const AUDIT_TARGET_LABELS: Record<AuditTargetType, string> = {
  job: '職缺',
  candidate: '候選人',
  application: '應徵',
  interview: '面試',
  offer: 'Offer',
  user: '使用者',
}
