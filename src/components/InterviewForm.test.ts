import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import InterviewForm from './InterviewForm.vue'

import type { Application } from '../types/application'
import type { User } from '../types/auth'
import type { Interview } from '../types/interview'

const applications: Application[] = [
  {
    id: 1,
    candidateId: 1,
    jobId: 1,
    candidateName: '陳小明',
    jobTitle: 'Frontend Engineer',
    jobDepartment: 'Engineering',
    status: 'interview',
    note: '',
    appliedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

const interviewers: User[] = [
  {
    id: 3,
    username: 'manager',
    name: '李冠廷',
    email: 'manager@hiremanage.example',
    role: 'manager',
    permissions: ['interview.read'],
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-01-01T00:00:00Z',
  },
]

const interview: Interview = {
  id: 1,
  applicationId: 1,
  candidateId: 1,
  jobId: 1,
  candidateName: '陳小明',
  jobTitle: 'Frontend Engineer',
  interviewerId: 3,
  interviewerName: '李冠廷',
  stage: 'technical',
  date: '2026-10-01',
  time: '14:00',
  durationMinutes: 90,
  mode: 'video',
  meetingLink: 'https://meet.example.com/1',
  location: '',
  notes: '',
  status: 'scheduled',
  feedback: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

function mountForm(props = {}) {
  return mount(InterviewForm, {
    props: {
      applicationOptions: applications,
      interviewerOptions: interviewers,
      ...props,
    },
  })
}

describe('InterviewForm', () => {
  it('空表單送出時顯示驗證錯誤且不 emit submit', async () => {
    const wrapper = mountForm()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('請選擇應徵紀錄')
    expect(wrapper.text()).toContain('請選擇面試官')
    expect(
      wrapper.find('#interview-application').attributes('aria-invalid'),
    ).toBe('true')
  })

  it('以 defaultApplicationId 預選應徵紀錄', () => {
    const wrapper = mountForm({ defaultApplicationId: 1 })

    const select = wrapper.find('#interview-application')
      .element as HTMLSelectElement

    expect(select.value).toBe('1')
  })

  it('視訊面試未填會議連結時顯示錯誤', async () => {
    const wrapper = mountForm({ defaultApplicationId: 1 })

    await wrapper.find('#interview-interviewer').setValue('3')
    await wrapper.find('#interview-stage').setValue('technical')
    await wrapper.find('#interview-date').setValue('2026-10-20')
    await wrapper.find('#interview-time').setValue('10:00')
    await wrapper.find('#interview-mode').setValue('video')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('視訊面試請輸入會議連結')
  })

  it('以 initial 預填並在送出時 emit 轉換後的 payload', async () => {
    const wrapper = mountForm({ initial: interview })

    expect(
      (wrapper.find('#interview-duration').element as HTMLInputElement).value,
    ).toBe('90')

    await wrapper.find('#interview-notes').setValue('  請準備作品集  ')
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('submit')

    expect(emitted).toHaveLength(1)
    expect(emitted?.[0][0]).toEqual({
      applicationId: 1,
      interviewerId: 3,
      stage: 'technical',
      date: '2026-10-01',
      time: '14:00',
      durationMinutes: 90,
      mode: 'video',
      meetingLink: 'https://meet.example.com/1',
      location: '',
      notes: '請準備作品集',
      status: 'scheduled',
    })
  })

  it('submitting 時停用送出按鈕', () => {
    const wrapper = mountForm({ submitting: true })

    const submit = wrapper.find('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toBe('儲存中...')
  })
})
