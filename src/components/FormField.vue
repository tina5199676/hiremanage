<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
}>()

const errorId = computed(() => `${props.id}-error`)
const hintId = computed(() => `${props.id}-hint`)

const describedBy = computed(() => {
  const ids: string[] = []

  if (props.hint) {
    ids.push(hintId.value)
  }

  if (props.error) {
    ids.push(errorId.value)
  }

  return ids.length > 0 ? ids.join(' ') : undefined
})
</script>

<template>
  <div>
    <label
      :for="id"
      class="mb-2 block text-sm font-medium text-slate-700"
    >
      {{ label }}

      <span
        v-if="required"
        aria-hidden="true"
        class="text-red-600"
      >
        *
      </span>
    </label>

    <slot
      :id="id"
      :described-by="describedBy"
      :invalid="Boolean(error)"
    />

    <p
      v-if="hint"
      :id="hintId"
      class="mt-1 text-xs text-slate-500"
    >
      {{ hint }}
    </p>

    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="mt-1 text-xs text-red-600"
    >
      {{ error }}
    </p>
  </div>
</template>
