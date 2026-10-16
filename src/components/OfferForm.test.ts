import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OfferForm from './OfferForm.vue'

import type { Application } from '../types/application'
import type { Offer } from '../types/offer'

const applications: Application[] = [
  {
    id: 1,
    candidateId: 1,
    jobId: 1,
    candidateName: '陳小明',
    jobTitle: 'Frontend Engineer',
    jobDepartment: 'Engineering',
    status: 'offer',
    note: '',
    appliedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

const offer: Offer = {
  id: 1,
  applicationId: 1,
  candidateId: 1,
  jobId: 1,
  candidateName: '陳小明',
  jobTitle: 'Frontend Engineer',
  salary: 80000,
  startDate: '2026-12-01',
  expirationDate: '2026-11-15',
  benefits: ['勞健保', '年終獎金'],
  message: '錄取通知',
  status: 'sent',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

describe('OfferForm', () => {
  it('空表單送出時顯示驗證錯誤且不 emit submit', async () => {
    const wrapper = mount(OfferForm, {
      props: { applicationOptions: applications },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('請選擇應徵紀錄')
    expect(wrapper.text()).toContain('請輸入有效的薪資')
    expect(wrapper.find('#offer-salary').attributes('aria-invalid')).toBe('true')
  })

  it('有效期限晚於到職日期時顯示錯誤', async () => {
    const wrapper = mount(OfferForm, {
      props: { applicationOptions: applications, defaultApplicationId: 1 },
    })

    await wrapper.find('#offer-salary').setValue('80000')
    await wrapper.find('#offer-start-date').setValue('2026-12-01')
    await wrapper.find('#offer-expiration-date').setValue('2026-12-10')
    await wrapper.find('#offer-message').setValue('錄取通知')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Offer 有效期限不能晚於到職日期')
  })

  it('編輯模式隱藏應徵紀錄選單並以 initial 預填', async () => {
    const wrapper = mount(OfferForm, { props: { initial: offer } })

    expect(wrapper.find('#offer-application').exists()).toBe(false)
    expect(wrapper.text()).toContain('陳小明')
    expect(
      (wrapper.find('#offer-benefits').element as HTMLInputElement).value,
    ).toBe('勞健保, 年終獎金')

    await wrapper.find('#offer-benefits').setValue('勞健保, 遠端工作 , ')
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('submit')

    expect(emitted).toHaveLength(1)
    expect(emitted?.[0][0]).toEqual({
      applicationId: 1,
      salary: 80000,
      startDate: '2026-12-01',
      expirationDate: '2026-11-15',
      benefits: ['勞健保', '遠端工作'],
      message: '錄取通知',
      status: 'sent',
    })
  })

  it('點擊取消時 emit cancel', async () => {
    const wrapper = mount(OfferForm)

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
