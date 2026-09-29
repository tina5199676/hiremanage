<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    tone?: 'danger' | 'primary'
  }>(),
  {
    confirmLabel: '確認',
    cancelLabel: '取消',
    loading: false,
    tone: 'danger',
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const cancelButton = ref<HTMLButtonElement | null>(null)

let previousFocus: HTMLElement | null = null

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null

      await nextTick()

      cancelButton.value?.focus()
    } else {
      previousFocus?.focus()
      previousFocus = null
    }
  },
)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.loading) {
    emit('cancel')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      @keydown="handleKeydown"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          class="text-lg font-semibold text-slate-900"
        >
          {{ title }}
        </h2>

        <p
          id="confirm-dialog-message"
          class="mt-2 text-sm text-slate-600"
        >
          {{ message }}
        </p>

        <div class="mt-6 flex justify-end gap-2">
          <button
            ref="cancelButton"
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>

          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :class="
              tone === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-500'
            "
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ loading ? '處理中...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
