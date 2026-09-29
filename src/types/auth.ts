export type Role = 'admin' | 'hr' | 'manager'

export type Permission =
  | 'dashboard.read'
  | 'job.read'
  | 'job.create'
  | 'job.update'
  | 'job.delete'
  | 'candidate.read'
  | 'candidate.create'
  | 'candidate.update'
  | 'candidate.delete'
  | 'candidate.note'
  | 'application.read'
  | 'application.create'
  | 'application.update'
  | 'application.delete'
  | 'interview.read'
  | 'interview.create'
  | 'interview.update'
  | 'interview.delete'
  | 'interview.feedback'
  | 'offer.read'
  | 'offer.create'
  | 'offer.update'
  | 'offer.delete'
  | 'notification.read'
  | 'audit.read'
  | 'user.read'

/** '*' 代表擁有全部權限（System Admin） */
export type PermissionGrant = Permission | '*'

export interface User {
  id: number
  username: string
  name: string
  email: string
  role: Role
  permissions: PermissionGrant[]
  avatarColor: string
  createdAt: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: User
  }
  message?: string
}

export interface CurrentUserResponse {
  success: boolean
  data: User | null
  message?: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
}
