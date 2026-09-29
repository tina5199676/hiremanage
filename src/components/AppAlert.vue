<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    tone?: 'error' | 'success' | 'info'
  }>(),
  {
    tone: 'error',
  },
)

const toneClasses = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
}
</script>

<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    class="rounded-lg border px-4 py-3 text-sm"
    :class="toneClasses[tone]"
  >
    {{ message }}
  </div>
</template>
