import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.ts', 'mock/**/*.test.ts'],
      exclude: ['e2e/**', 'node_modules/**'],
      setupFiles: ['./src/test/setup.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/main.ts', 'src/**/*.test.ts', 'src/test/**'],
      },
    },
  }),
)
