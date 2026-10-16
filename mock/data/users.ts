import { getMockPassword } from '../../src/config/mock'

import type { User } from '../../src/types/auth'

export interface MockUserRecord extends User {
  /**
   * 僅供 Mock 登入使用。
   * 由 .env 的 VITE_MOCK_*_PASSWORD 提供；未設定時為 null，該帳號無法登入。
   */
  password: string | null
}

export const users: MockUserRecord[] = [
  {
    id: 1,
    username: 'admin',
    password: getMockPassword('admin'),
    name: '王建宏',
    email: 'admin@hiremanage.example',
    role: 'admin',
    permissions: ['*'],
    avatarColor: 'bg-slate-900',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'hr',
    password: getMockPassword('hr'),
    name: '張雅婷',
    email: 'hr@hiremanage.example',
    role: 'hr',
    permissions: [
      'dashboard.read',
      'job.read',
      'job.create',
      'job.update',
      'job.delete',
      'candidate.read',
      'candidate.create',
      'candidate.update',
      'candidate.delete',
      'candidate.note',
      'application.read',
      'application.create',
      'application.update',
      'application.delete',
      'interview.read',
      'interview.create',
      'interview.update',
      'interview.delete',
      'interview.feedback',
      'offer.read',
      'offer.create',
      'offer.update',
      'offer.delete',
      'notification.read',
    ],
    avatarColor: 'bg-blue-600',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'manager',
    password: getMockPassword('manager'),
    name: '李冠廷',
    email: 'manager@hiremanage.example',
    role: 'manager',
    permissions: [
      'dashboard.read',
      'job.read',
      'candidate.read',
      'application.read',
      'application.update',
      'interview.read',
      'interview.feedback',
      'offer.read',
      'notification.read',
    ],
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-02-01T00:00:00Z',
  },
]

export function toPublicUser(record: MockUserRecord): User {
  const { password: _password, ...user } = record

  return user
}
