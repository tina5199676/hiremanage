<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '目前沒有資料',
    description: '',
  },
)
</script>

<template>
  <div class="px-5 py-12 text-center">
    <p class="text-sm font-medium text-slate-700">
      {{ title }}
    </p>

    <p
      v-if="description"
      class="mt-1 text-sm text-slate-500"
    >
      {{ description }}
    </p>

    <div
      v-if="$slots.default"
      class="mt-4"
    >
      <slot />
    </div>
  </div>
</template>
