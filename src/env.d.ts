/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 正式建置時是否啟用 MSW（展示用） */
  readonly VITE_ENABLE_MOCK?: string
  /** Mock 帳號密碼，由 .env 提供，不進版控 */
  readonly VITE_MOCK_ADMIN_PASSWORD?: string
  readonly VITE_MOCK_HR_PASSWORD?: string
  readonly VITE_MOCK_MANAGER_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
