import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './style.css'

import App from './App.vue'
import router from './router'
import { onUnauthorized } from './services/http'
import { useAuthStore } from './stores/auth'

async function bootstrap() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { worker } = await import('../mock/browser')

    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  const app = createApp(App)

  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // 任何 API 回傳 401 時，清除 session 並導向登入頁
  const authStore = useAuthStore(pinia)

  onUnauthorized(() => {
    authStore.clearSession()

    if (router.currentRoute.value.name !== 'login') {
      router.push({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }
  })

  app.mount('#app')
}

bootstrap()
