import type { ApplicationStatus } from '../types/application'
import type {
  CandidateSource,
  CandidateStatus,
} from '../types/candidate'
import type {
  InterviewMode,
  InterviewStage,
  InterviewStatus,
} from '../types/interview'
import type { JobStatus, WorkType } from '../types/job'
import type { OfferStatus } from '../types/offer'

export interface JobFormInput {
  title: string
  description: string
  department: string
  location: string
  workType: WorkType | ''
  salaryMin: string
  salaryMax: string
  experience: string
  education: string
  requiredSkills: string
  status: JobStatus | ''
}

export type JobFormErrors = Partial<
  Record<keyof JobFormInput, string>
>

export function validateJobForm(
  form: JobFormInput,
): JobFormErrors {
  const errors: JobFormErrors = {}

  if (!form.title.trim()) {
    errors.title = '請輸入職缺名稱'
  }

  if (!form.description.trim()) {
    errors.description = '請輸入職缺描述'
  }

  if (!form.department.trim()) {
    errors.department = '請輸入部門'
  }

  if (!form.location.trim()) {
    errors.location = '請輸入工作地點'
  }

  if (!form.workType) {
    errors.workType = '請選擇工作型態'
  }

  const salaryMin = Number(form.salaryMin)
  const salaryMax = Number(form.salaryMax)

  if (
    form.salaryMin === '' ||
    Number.isNaN(salaryMin) ||
    salaryMin < 0
  ) {
    errors.salaryMin = '請輸入有效的最低薪資'
  }

  if (
    form.salaryMax === '' ||
    Number.isNaN(salaryMax) ||
    salaryMax < 0
  ) {
    errors.salaryMax = '請輸入有效的最高薪資'
  }

  if (
    !errors.salaryMin &&
    !errors.salaryMax &&
    salaryMax < salaryMin
  ) {
    errors.salaryMax =
      '最高薪資不能低於最低薪資'
  }

  if (!form.experience.trim()) {
    errors.experience = '請輸入經驗要求'
  }

  if (!form.education.trim()) {
    errors.education = '請輸入學歷要求'
  }

  if (!form.requiredSkills.trim()) {
    errors.requiredSkills =
      '請輸入至少一項必要技能'
  }

  if (!form.status) {
    errors.status = '請選擇職缺狀態'
  }

  return errors
}

// --------------------------------------------------
// Login form
// --------------------------------------------------

export interface LoginFormInput {
  username: string
  password: string
}

export type LoginFormErrors = Partial<
  Record<keyof LoginFormInput, string>
>

export function validateLoginForm(
  form: LoginFormInput,
): LoginFormErrors {
  const errors: LoginFormErrors = {}

  if (!form.username.trim()) {
    errors.username = '請輸入帳號'
  }

  if (!form.password) {
    errors.password = '請輸入密碼'
  }

  return errors
}

// --------------------------------------------------
// Shared helpers
// --------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
}

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

// --------------------------------------------------
// Candidate form
// --------------------------------------------------


export interface CandidateFormInput {
  name: string
  email: string
  phone: string
  currentTitle: string
  currentCompany: string
  location: string
  experience: string
  education: string
  skills: string
  source: CandidateSource | ''
  status: CandidateStatus | ''
}

export type CandidateFormErrors = Partial<
  Record<keyof CandidateFormInput, string>
>

export function validateCandidateForm(
  form: CandidateFormInput,
): CandidateFormErrors {
  const errors: CandidateFormErrors = {}

  if (!form.name.trim()) {
    errors.name = '請輸入姓名'
  }

  if (!form.email.trim()) {
    errors.email = '請輸入 Email'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Email 格式不正確'
  }

  if (!form.phone.trim()) {
    errors.phone = '請輸入電話'
  }

  if (!form.currentTitle.trim()) {
    errors.currentTitle = '請輸入目前職稱'
  }

  if (!form.currentCompany.trim()) {
    errors.currentCompany = '請輸入目前公司'
  }

  if (!form.location.trim()) {
    errors.location = '請輸入所在地'
  }

  if (!form.experience.trim()) {
    errors.experience = '請輸入工作經驗'
  }

  if (!form.education.trim()) {
    errors.education = '請輸入學歷'
  }

  if (!form.skills.trim()) {
    errors.skills = '請輸入至少一項技能'
  }

  if (!form.source) {
    errors.source = '請選擇來源'
  }

  if (!form.status) {
    errors.status = '請選擇狀態'
  }

  return errors
}

// --------------------------------------------------
// Candidate note form
// --------------------------------------------------

export function validateNoteContent(content: string): string | null {
  const trimmed = content.trim()

  if (!trimmed) {
    return '請輸入備註內容'
  }

  if (trimmed.length > 500) {
    return '備註內容不能超過 500 字'
  }

  return null
}

// --------------------------------------------------
// Application form
// --------------------------------------------------


export interface ApplicationFormInput {
  candidateId: string
  jobId: string
  status: ApplicationStatus | ''
  note: string
}

export type ApplicationFormErrors = Partial<
  Record<keyof ApplicationFormInput, string>
>

export function validateApplicationForm(
  form: ApplicationFormInput,
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {}

  if (!form.candidateId) {
    errors.candidateId = '請選擇候選人'
  }

  if (!form.jobId) {
    errors.jobId = '請選擇職缺'
  }

  if (!form.status) {
    errors.status = '請選擇狀態'
  }

  if (form.note.length > 500) {
    errors.note = '備註不能超過 500 字'
  }

  return errors
}

// --------------------------------------------------
// Interview form
// --------------------------------------------------


export interface InterviewFormInput {
  applicationId: string
  interviewerId: string
  stage: InterviewStage | ''
  date: string
  time: string
  durationMinutes: string
  mode: InterviewMode | ''
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus | ''
}

export type InterviewFormErrors = Partial<
  Record<keyof InterviewFormInput, string>
>

export function validateInterviewForm(
  form: InterviewFormInput,
): InterviewFormErrors {
  const errors: InterviewFormErrors = {}

  if (!form.applicationId) {
    errors.applicationId = '請選擇應徵紀錄'
  }

  if (!form.interviewerId) {
    errors.interviewerId = '請選擇面試官'
  }

  if (!form.stage) {
    errors.stage = '請選擇面試階段'
  }

  if (!form.date) {
    errors.date = '請選擇日期'
  } else if (!isValidDate(form.date)) {
    errors.date = '日期格式不正確'
  }

  if (!form.time) {
    errors.time = '請選擇時間'
  } else if (!isValidTime(form.time)) {
    errors.time = '時間格式不正確'
  }

  const duration = Number(form.durationMinutes)

  if (
    form.durationMinutes === '' ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 480
  ) {
    errors.durationMinutes = '面試時長需介於 15 至 480 分鐘'
  }

  if (!form.mode) {
    errors.mode = '請選擇面試方式'
  } else if (form.mode === 'video' && !form.meetingLink.trim()) {
    errors.meetingLink = '視訊面試請輸入會議連結'
  } else if (form.mode === 'onsite' && !form.location.trim()) {
    errors.location = '現場面試請輸入地點'
  }

  if (!form.status) {
    errors.status = '請選擇狀態'
  }

  return errors
}

// --------------------------------------------------
// Interview feedback form
// --------------------------------------------------

export interface FeedbackFormInput {
  score: string
  feedback: string
  notes: string
}

export type FeedbackFormErrors = Partial<
  Record<keyof FeedbackFormInput, string>
>

export function validateFeedbackForm(
  form: FeedbackFormInput,
): FeedbackFormErrors {
  const errors: FeedbackFormErrors = {}

  const score = Number(form.score)

  if (
    form.score === '' ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5
  ) {
    errors.score = '請給予 1 至 5 分的評分'
  }

  if (!form.feedback.trim()) {
    errors.feedback = '請輸入面試回饋'
  }

  return errors
}

// --------------------------------------------------
// Offer form
// --------------------------------------------------


export interface OfferFormInput {
  applicationId: string
  salary: string
  startDate: string
  expirationDate: string
  benefits: string
  message: string
  status: OfferStatus | ''
}

export type OfferFormErrors = Partial<
  Record<keyof OfferFormInput, string>
>

export function validateOfferForm(
  form: OfferFormInput,
): OfferFormErrors {
  const errors: OfferFormErrors = {}

  if (!form.applicationId) {
    errors.applicationId = '請選擇應徵紀錄'
  }

  const salary = Number(form.salary)

  if (form.salary === '' || Number.isNaN(salary) || salary <= 0) {
    errors.salary = '請輸入有效的薪資'
  }

  if (!form.startDate) {
    errors.startDate = '請選擇到職日期'
  } else if (!isValidDate(form.startDate)) {
    errors.startDate = '日期格式不正確'
  }

  if (!form.expirationDate) {
    errors.expirationDate = '請選擇 Offer 有效期限'
  } else if (!isValidDate(form.expirationDate)) {
    errors.expirationDate = '日期格式不正確'
  } else if (
    !errors.startDate &&
    form.expirationDate > form.startDate
  ) {
    errors.expirationDate = 'Offer 有效期限不能晚於到職日期'
  }

  if (!form.message.trim()) {
    errors.message = '請輸入 Offer 說明'
  }

  if (!form.status) {
    errors.status = '請選擇狀態'
  }

  return errors
}
