<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    totalPages: number
    ariaLabel?: string
  }>(),
  {
    ariaLabel: '分頁',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const startItem = computed(() => {
  if (props.total === 0) {
    return 0
  }

  return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.page * props.pageSize, props.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = props.totalPages
  const current = props.page

  if (total <= 7) {
    for (let page = 1; page <= total; page += 1) {
      pages.push(page)
    }

    return pages
  }

  pages.push(1)

  if (current > 4) {
    pages.push(-1)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < total - 3) {
    pages.push(-1)
  }

  pages.push(total)

  return pages
})

function goToPage(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) {
    return
  }

  emit('update:page', page)
}
</script>

<template>
  <div
    class="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-slate-500">
      顯示
      <span class="font-medium text-slate-700">{{ startItem }}</span>
      -
      <span class="font-medium text-slate-700">{{ endItem }}</span>
      筆，共
      <span class="font-medium text-slate-700">{{ total }}</span>
      筆
    </p>

    <nav
      :aria-label="ariaLabel"
      class="flex items-center gap-1"
    >
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page === 1"
        @click="goToPage(page - 1)"
      >
        上一頁
      </button>

      <template
        v-for="(item, index) in visiblePages"
        :key="`${item}-${index}`"
      >
        <span
          v-if="item === -1"
          aria-hidden="true"
          class="px-2 text-sm text-slate-400"
        >
          …
        </span>

        <button
          v-else
          type="button"
          class="min-w-9 rounded-md border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400"
          :class="
            item === page
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          "
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="`第 ${item} 頁`"
          @click="goToPage(item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        下一頁
      </button>
    </nav>
  </div>
</template>
