import { defineConfig, devices } from '@playwright/test'

// 讀取 .env 的 VITE_MOCK_*_PASSWORD 供 e2e 登入使用；沒有 .env 時略過
try {
  process.loadEnvFile('.env')
} catch {
  // .env 不存在，改由 CI 或 shell 環境變數提供
}

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
