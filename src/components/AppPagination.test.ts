import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppPagination from './AppPagination.vue'

function mountPagination(page: number, totalPages: number) {
  return mount(AppPagination, {
    props: {
      page,
      pageSize: 10,
      total: totalPages * 10,
      totalPages,
    },
  })
}

describe('AppPagination', () => {
  it('顯示目前範圍與總筆數', () => {
    const wrapper = mountPagination(2, 5)

    expect(wrapper.text()).toContain('11')
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('50')
  })

  it('第一頁時停用上一頁，最後一頁時停用下一頁', () => {
    const first = mountPagination(1, 3)
    const buttons = first.findAll('button')

    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[buttons.length - 1].attributes('disabled')).toBeUndefined()

    const last = mountPagination(3, 3)
    const lastButtons = last.findAll('button')

    expect(lastButtons[lastButtons.length - 1].attributes('disabled')).toBeDefined()
  })

  it('點擊頁碼時 emit update:page', async () => {
    const wrapper = mountPagination(1, 3)

    await wrapper.find('button[aria-label="第 3 頁"]').trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })

  it('點擊目前頁碼時不 emit', async () => {
    const wrapper = mountPagination(2, 3)

    await wrapper.find('button[aria-current="page"]').trigger('click')

    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('頁數多時以省略號縮短頁碼', () => {
    const wrapper = mountPagination(10, 20)

    expect(wrapper.text()).toContain('…')
    expect(wrapper.find('button[aria-label="第 1 頁"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="第 20 頁"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="第 5 頁"]').exists()).toBe(false)
  })
})
