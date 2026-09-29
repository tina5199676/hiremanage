<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: '載入中...',
  },
)
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="flex items-center justify-center gap-3 px-5 py-12 text-sm text-slate-500"
  >
    <span
      aria-hidden="true"
      class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
    />

    {{ message }}
  </div>
</template>
