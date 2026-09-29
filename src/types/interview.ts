import type {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
} from './common'

export type InterviewStage =
  | 'phone-screen'
  | 'technical'
  | 'hiring-manager'
  | 'final'

export type InterviewMode = 'onsite' | 'video' | 'phone'

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled'

export interface InterviewFeedback {
  /** 1 - 5 分 */
  score: number
  feedback: string
  notes: string
  submittedById: number
  submittedByName: string
  submittedAt: string
}

export interface Interview {
  id: number
  applicationId: number
  candidateId: number
  jobId: number
  /** 由 Mock API 解析 */
  candidateName: string
  /** 由 Mock API 解析 */
  jobTitle: string
  interviewerId: number
  /** 由 Mock API 解析 */
  interviewerName: string
  stage: InterviewStage
  /** YYYY-MM-DD */
  date: string
  /** HH:mm (24h) */
  time: string
  durationMinutes: number
  mode: InterviewMode
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus
  feedback: InterviewFeedback | null
  createdAt: string
  updatedAt: string
}

export interface InterviewQuery {
  /** YYYY-MM-DD，取得該區間內的面試（含） */
  from?: string
  to?: string
  status?: InterviewStatus
  candidateId?: number
  interviewerId?: number
  page?: number
  pageSize?: number
}

export interface CreateInterviewInput {
  applicationId: number
  interviewerId: number
  stage: InterviewStage
  date: string
  time: string
  durationMinutes: number
  mode: InterviewMode
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus
}

export type UpdateInterviewInput = CreateInterviewInput

export interface SubmitFeedbackInput {
  score: number
  feedback: string
  notes: string
}

export type InterviewListResponse = ApiListResponse<Interview>

export type InterviewDetailResponse = ApiItemResponse<Interview>

export interface CreateInterviewResponse {
  success: boolean
  data: Interview
  message?: string
}

export type UpdateInterviewResponse = ApiItemResponse<Interview>

export type DeleteInterviewResponse = ApiMessageResponse

export type SubmitFeedbackResponse = ApiItemResponse<Interview>
