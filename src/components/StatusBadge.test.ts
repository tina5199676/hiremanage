import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('顯示 label 並套用對應 tone 的樣式', () => {
    const wrapper = mount(StatusBadge, {
      props: { label: '開放中', tone: 'success' },
    })

    expect(wrapper.text()).toBe('開放中')
    expect(wrapper.classes()).toContain('bg-emerald-50')
  })

  it('預設使用 neutral tone', () => {
    const wrapper = mount(StatusBadge, { props: { label: '草稿' } })

    expect(wrapper.classes()).toContain('bg-slate-100')
  })
})
