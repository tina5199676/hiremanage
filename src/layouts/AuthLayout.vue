<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-wider text-blue-600">
          HireManage
        </p>

        <h1 class="mt-2 text-2xl font-bold text-slate-900">
          智慧面試管理平台
        </h1>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <RouterView />
      </div>
    </div>
  </main>
</template>
