import { describe, expect, it } from 'vitest'

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from './permissions'

describe('permissions', () => {
  it("'*' 代表擁有全部權限", () => {
    expect(hasPermission(['*'], 'job.delete')).toBe(true)
    expect(hasAllPermissions(['*'], ['job.create', 'audit.read'])).toBe(true)
  })

  it('只有列出的權限才會通過', () => {
    const grants = ['job.read', 'candidate.read'] as const

    expect(hasPermission(grants, 'job.read')).toBe(true)
    expect(hasPermission(grants, 'job.create')).toBe(false)
  })

  it('hasAnyPermission 只要其中一個符合即通過', () => {
    expect(hasAnyPermission(['job.read'], ['job.create', 'job.read'])).toBe(true)
    expect(hasAnyPermission(['job.read'], ['job.create'])).toBe(false)
  })

  it('hasAllPermissions 需要全部符合', () => {
    expect(hasAllPermissions(['job.read', 'job.create'], ['job.read', 'job.create'])).toBe(true)
    expect(hasAllPermissions(['job.read'], ['job.read', 'job.create'])).toBe(false)
  })
})
