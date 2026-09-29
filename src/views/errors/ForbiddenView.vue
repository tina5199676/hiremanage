<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="max-w-md text-center">
      <p class="text-sm font-semibold uppercase tracking-wider text-red-600">
        403
      </p>

      <h1 class="mt-2 text-2xl font-bold text-slate-900">
        沒有存取權限
      </h1>

      <p class="mt-2 text-sm text-slate-600">
        您目前的帳號沒有檢視此頁面的權限。如需存取，請聯絡系統管理員。
      </p>

      <div class="mt-6 flex justify-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
          @click="router.back()"
        >
          返回上一頁
        </button>

        <RouterLink
          to="/admin"
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          回到總覽
        </RouterLink>
      </div>
    </div>
  </main>
</template>
