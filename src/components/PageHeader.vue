<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ title }}
        </h1>

        <p
          v-if="description"
          class="mt-1 text-sm text-slate-500"
        >
          {{ description }}
        </p>
      </div>

      <div
        v-if="$slots.actions"
        class="flex flex-wrap items-center gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
