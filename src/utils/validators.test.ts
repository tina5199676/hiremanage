import { describe, expect, it } from 'vitest'

import {
  validateApplicationForm,
  validateCandidateForm,
  validateJobForm,
  validateLoginForm,
  validateNoteContent,
  validateOfferForm,
} from './validators'

import type { JobFormInput, OfferFormInput } from './validators'

const validJobForm: JobFormInput = {
  title: 'Frontend Engineer',
  description: '負責前端開發',
  department: 'Engineering',
  location: 'Taipei',
  workType: 'hybrid',
  salaryMin: '60000',
  salaryMax: '90000',
  experience: '3+ years',
  education: 'Bachelor',
  requiredSkills: 'Vue 3, TypeScript',
  status: 'open',
}

describe('validateJobForm', () => {
  it('回傳空物件代表表單有效', () => {
    expect(validateJobForm(validJobForm)).toEqual({})
  })

  it('必填欄位為空白時回傳錯誤訊息', () => {
    const errors = validateJobForm({
      ...validJobForm,
      title: '   ',
      workType: '',
      status: '',
    })

    expect(errors.title).toBe('請輸入職缺名稱')
    expect(errors.workType).toBe('請選擇工作型態')
    expect(errors.status).toBe('請選擇職缺狀態')
  })

  it('最高薪資低於最低薪資時回傳錯誤', () => {
    const errors = validateJobForm({
      ...validJobForm,
      salaryMin: '90000',
      salaryMax: '60000',
    })

    expect(errors.salaryMax).toBe('最高薪資不能低於最低薪資')
    expect(errors.salaryMin).toBeUndefined()
  })

  it('薪資不是數字或為負數時回傳錯誤', () => {
    const errors = validateJobForm({
      ...validJobForm,
      salaryMin: 'abc',
      salaryMax: '-1',
    })

    expect(errors.salaryMin).toBe('請輸入有效的最低薪資')
    expect(errors.salaryMax).toBe('請輸入有效的最高薪資')
  })
})

describe('validateLoginForm', () => {
  it('帳號與密碼皆為空時回傳兩個錯誤', () => {
    const errors = validateLoginForm({ username: ' ', password: '' })

    expect(errors).toEqual({
      username: '請輸入帳號',
      password: '請輸入密碼',
    })
  })

  it('填寫完整時沒有錯誤', () => {
    expect(validateLoginForm({ username: 'admin', password: 'x' })).toEqual({})
  })
})

describe('validateCandidateForm', () => {
  const valid = {
    name: '陳柏宇',
    email: 'boyu@example.com',
    phone: '0912-000-000',
    currentTitle: 'Engineer',
    currentCompany: 'Example',
    location: 'Taipei',
    experience: '3+ years',
    education: 'Bachelor',
    skills: 'Vue',
    source: 'linkedin' as const,
    status: 'active' as const,
  }

  it('有效表單沒有錯誤', () => {
    expect(validateCandidateForm(valid)).toEqual({})
  })

  it('Email 格式錯誤時回傳錯誤', () => {
    expect(validateCandidateForm({ ...valid, email: 'not-an-email' }).email).toBe(
      'Email 格式不正確',
    )
  })
})

describe('validateNoteContent', () => {
  it('空白內容回傳錯誤', () => {
    expect(validateNoteContent('   ')).toBe('請輸入備註內容')
  })

  it('超過 500 字回傳錯誤', () => {
    expect(validateNoteContent('a'.repeat(501))).toBe('備註內容不能超過 500 字')
  })

  it('正常內容回傳 null', () => {
    expect(validateNoteContent('ok')).toBeNull()
  })
})

describe('validateApplicationForm', () => {
  it('未選擇候選人與職缺時回傳錯誤', () => {
    const errors = validateApplicationForm({
      candidateId: '',
      jobId: '',
      status: 'applied',
      note: '',
    })

    expect(errors.candidateId).toBe('請選擇候選人')
    expect(errors.jobId).toBe('請選擇職缺')
    expect(errors.status).toBeUndefined()
  })
})

describe('validateOfferForm', () => {
  const valid: OfferFormInput = {
    applicationId: '1',
    salary: '80000',
    startDate: '2026-11-01',
    expirationDate: '2026-10-15',
    benefits: '勞健保',
    message: '歡迎加入',
    status: 'draft',
  }

  it('有效表單沒有錯誤', () => {
    expect(validateOfferForm(valid)).toEqual({})
  })

  it('有效期限晚於到職日期時回傳錯誤', () => {
    expect(
      validateOfferForm({ ...valid, expirationDate: '2026-12-01' }).expirationDate,
    ).toBe('Offer 有效期限不能晚於到職日期')
  })

  it('薪資無效時回傳錯誤', () => {
    expect(validateOfferForm({ ...valid, salary: '0' }).salary).toBe(
      '請輸入有效的薪資',
    )
  })
})
