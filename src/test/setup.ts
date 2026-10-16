import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// 單元測試使用與瀏覽器相同的 MSW handlers，
// 讓 service / store 測試走完整的 request → mock API 流程。
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => server.close())
