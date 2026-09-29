<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="max-w-md text-center">
      <p class="text-sm font-semibold uppercase tracking-wider text-slate-500">
        404
      </p>

      <h1 class="mt-2 text-2xl font-bold text-slate-900">
        找不到頁面
      </h1>

      <p class="mt-2 text-sm text-slate-600">
        您要找的頁面不存在或已被移除。
      </p>

      <RouterLink
        to="/admin"
        class="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        回到總覽
      </RouterLink>
    </div>
  </main>
</template>
