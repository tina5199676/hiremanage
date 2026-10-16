<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppAlert from '../../components/AppAlert.vue'
import FormField from '../../components/FormField.vue'
import { getMockPassword, isMockEnabled } from '../../config/mock'
import { useAuthStore } from '../../stores/auth'
import { ROLE_LABELS } from '../../utils/permissions'
import { validateLoginForm } from '../../utils/validators'

import type { Role } from '../../types/auth'
import type { LoginFormErrors } from '../../utils/validators'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const errors = ref<LoginFormErrors>({})

/**
 * 測試帳號面板只在 Mock 模式顯示，密碼來自 .env（不顯示在畫面上），
 * 沒有設定密碼的帳號不列出。
 */
const DEMO_ROLES: Array<{ role: Role; username: string }> = [
  { role: 'admin', username: 'admin' },
  { role: 'hr', username: 'hr' },
  { role: 'manager', username: 'manager' },
]

const demoAccounts = isMockEnabled
  ? DEMO_ROLES.flatMap(({ role, username }) => {
      const password = getMockPassword(role)

      return password
        ? [{ label: ROLE_LABELS[role], username, password }]
        : []
    })
  : []

function fillDemo(username: string, password: string) {
  form.username = username
  form.password = password
  errors.value = {}
}

async function handleSubmit() {
  errors.value = validateLoginForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const success = await authStore.login({
    username: form.username.trim(),
    password: form.password,
  })

  if (!success) {
    return
  }

  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.replace(redirect)
  } else {
    router.replace({ name: 'dashboard' })
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-slate-900">
      登入
    </h2>

    <p class="mt-1 text-sm text-slate-500">
      請輸入帳號與密碼以進入系統
    </p>

    <form
      class="mt-6 space-y-5"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <AppAlert
        v-if="authStore.error"
        :message="authStore.error"
      />

      <FormField
        id="login-username"
        label="帳號"
        :error="errors.username"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.username"
            type="text"
            name="username"
            autocomplete="username"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
            class="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2"
            :class="
              invalid
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            "
          />
        </template>
      </FormField>

      <FormField
        id="login-password"
        label="密碼"
        :error="errors.password"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.password"
            type="password"
            name="password"
            autocomplete="current-password"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
            class="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2"
            :class="
              invalid
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            "
          />
        </template>
      </FormField>

      <button
        type="submit"
        class="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? '登入中...' : '登入' }}
      </button>
    </form>

    <section
      v-if="demoAccounts.length > 0"
      class="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4"
      aria-labelledby="demo-accounts-title"
    >
      <h3
        id="demo-accounts-title"
        class="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        測試帳號
      </h3>

      <ul class="mt-3 space-y-2">
        <li
          v-for="account in demoAccounts"
          :key="account.username"
          class="flex items-center justify-between gap-3 text-sm"
        >
          <div>
            <p class="font-medium text-slate-800">
              {{ account.label }}
            </p>

            <p class="text-xs text-slate-500">
              帳號 {{ account.username }}
            </p>
          </div>

          <button
            type="button"
            class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            @click="fillDemo(account.username, account.password)"
          >
            帶入
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
