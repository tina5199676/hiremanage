import { users } from '../../mock/data/users'
import { useAuthStore } from '../stores/auth'

/**
 * 測試用登入：密碼從 Mock 使用者資料取得（來源是 .env），
 * 避免在測試檔中寫死密碼。
 */
export async function loginAs(username: string): Promise<void> {
  const record = users.find((user) => user.username === username)

  if (!record?.password) {
    throw new Error(
      `Mock 帳號 ${username} 沒有設定密碼，請確認 .env（參考 .env.example）`,
    )
  }

  const authStore = useAuthStore()

  await authStore.login({ username, password: record.password })
}
