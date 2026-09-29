<script setup lang="ts">
import { computed } from 'vue'

import type { SortOrder } from '../types/common'

const props = defineProps<{
  label: string
  active: boolean
  order: SortOrder
}>()

const emit = defineEmits<{
  toggle: []
}>()

const icon = computed(() => {
  if (!props.active) {
    return '↕'
  }

  return props.order === 'asc' ? '↑' : '↓'
})

const ariaLabel = computed(() => {
  if (!props.active) {
    return `依${props.label}排序`
  }

  return props.order === 'asc'
    ? `${props.label}目前為升冪排序，點擊切換為降冪`
    : `${props.label}目前為降冪排序，點擊切換為升冪`
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    :aria-label="ariaLabel"
    :aria-pressed="active"
    @click="emit('toggle')"
  >
    {{ label }}

    <span
      aria-hidden="true"
      class="text-sm"
    >
      {{ icon }}
    </span>
  </button>
</template>
