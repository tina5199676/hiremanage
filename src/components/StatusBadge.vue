<script setup lang="ts">
export type BadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'

const props = withDefaults(
  defineProps<{
    label: string
    tone?: BadgeTone
  }>(),
  {
    tone: 'neutral',
  },
)

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
}

function getClass() {
  return toneClasses[props.tone]
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
    :class="getClass()"
  >
    {{ label }}
  </span>
</template>
