<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    retryLabel?: string
    showRetry?: boolean
  }>(),
  {
    message: '無法取得資料',
    retryLabel: '重新載入',
    showRetry: false,
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    role="alert"
    class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p>{{ message }}</p>

      <button
        v-if="showRetry"
        type="button"
        class="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        @click="emit('retry')"
      >
        {{ retryLabel }}
      </button>
    </div>
  </div>
</template>
