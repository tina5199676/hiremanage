import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JobForm from './JobForm.vue'

import type { Job } from '../types/job'

const job: Job = {
  id: 1,
  title: 'Frontend Engineer',
  description: '前端開發',
  department: 'Engineering',
  location: 'Taipei',
  workType: 'hybrid',
  salaryMin: 60000,
  salaryMax: 90000,
  experience: '3+ years',
  education: 'Bachelor',
  requiredSkills: ['Vue 3', 'TypeScript'],
  status: 'open',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

describe('JobForm', () => {
  it('空表單送出時顯示驗證錯誤且不 emit submit', async () => {
    const wrapper = mount(JobForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('請輸入職缺名稱')
    expect(wrapper.find('#job-title').attributes('aria-invalid')).toBe('true')
  })

  it('以 initial 預填並在送出時 emit 轉換後的 payload', async () => {
    const wrapper = mount(JobForm, { props: { initial: job } })

    expect((wrapper.find('#job-title').element as HTMLInputElement).value).toBe(
      'Frontend Engineer',
    )

    await wrapper.find('#job-required-skills').setValue('Vue 3, Vitest , ')
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('submit')

    expect(emitted).toHaveLength(1)
    expect(emitted?.[0][0]).toMatchObject({
      title: 'Frontend Engineer',
      salaryMin: 60000,
      salaryMax: 90000,
      requiredSkills: ['Vue 3', 'Vitest'],
      status: 'open',
    })
  })

  it('submitting 時停用送出按鈕並顯示儲存中', () => {
    const wrapper = mount(JobForm, { props: { submitting: true } })

    const submit = wrapper.find('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toBe('儲存中...')
  })

  it('點擊取消時 emit cancel', async () => {
    const wrapper = mount(JobForm)

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
