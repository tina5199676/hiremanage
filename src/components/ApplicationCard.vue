<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '../utils/formatters'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from '../utils/labels'

import type { Application, ApplicationStatus } from '../types/application'

const props = defineProps<{
  application: Application
  canUpdate: boolean
  updating: boolean
}>()

const emit = defineEmits<{
  'change-status': [status: ApplicationStatus]
}>()

const statusOptions = computed(() =>
  APPLICATION_STATUS_ORDER.map((status) => ({
    value: status,
    label: APPLICATION_STATUS_LABELS[status],
  })),
)

const selectId = computed(() => `application-status-${props.application.id}`)

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as ApplicationStatus

  if (value !== props.application.status) {
    emit('change-status', value)
  }
}
</script>

<template>
  <article
    class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition"
    :class="updating ? 'opacity-60' : ''"
    :aria-busy="updating"
  >
    <RouterLink
      :to="{ name: 'application-detail', params: { id: application.id } }"
      class="rounded text-sm font-semibold text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {{ application.candidateName }}
    </RouterLink>

    <p class="mt-1 text-xs text-slate-600">
      {{ application.jobTitle }}
    </p>

    <p class="text-xs text-slate-500">
      {{ application.jobDepartment }} ・ {{ formatDate(application.appliedAt) }}
    </p>

    <div
      v-if="canUpdate"
      class="mt-3"
    >
      <label
        :for="selectId"
        class="sr-only"
      >
        變更 {{ application.candidateName }} 的狀態
      </label>

      <select
        :id="selectId"
        :value="application.status"
        :disabled="updating"
        class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed"
        @change="handleChange"
      >
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </article>
</template>
