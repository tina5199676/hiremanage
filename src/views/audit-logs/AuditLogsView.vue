<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppPagination from '../../components/AppPagination.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuditLogStore } from '../../stores/auditLog'
import { formatDateTime } from '../../utils/formatters'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_TONES,
  AUDIT_TARGET_LABELS,
  toOptions,
} from '../../utils/labels'

import type { AuditAction, AuditTargetType } from '../../types/auditLog'

const auditLogStore = useAuditLogStore()

const actionOptions = toOptions(AUDIT_ACTION_LABELS, '全部操作')
const targetOptions = toOptions(AUDIT_TARGET_LABELS, '全部對象')

const searchInput = ref('')

function applyFilters() {
  auditLogStore.setQuery({
    search: searchInput.value.trim() || undefined,
    page: 1,
  })

  auditLogStore.fetchLogs()
}

function handleActionChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  auditLogStore.setQuery({
    action: value ? (value as AuditAction) : undefined,
    page: 1,
  })

  auditLogStore.fetchLogs()
}

function handleTargetChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  auditLogStore.setQuery({
    targetType: value ? (value as AuditTargetType) : undefined,
    page: 1,
  })

  auditLogStore.fetchLogs()
}

function clearFilters() {
  searchInput.value = ''
  auditLogStore.resetQuery()
  auditLogStore.fetchLogs()
}

function goToPage(page: number) {
  auditLogStore.setQuery({ page })
  auditLogStore.fetchLogs()
}

onMounted(() => {
  auditLogStore.fetchLogs()
})
</script>

<template>
  <div>
    <PageHeader
      title="稽核紀錄"
      description="系統中所有重要操作的紀錄"
    />

    <div class="mx-auto max-w-7xl px-6 py-6">
      <section
        aria-labelledby="audit-filter-title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="audit-filter-title"
          class="sr-only"
        >
          搜尋與篩選
        </h2>

        <div class="grid gap-4 lg:grid-cols-5">
          <div class="lg:col-span-2">
            <label
              for="audit-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋
            </label>

            <div class="flex gap-2">
              <input
                id="audit-search"
                v-model="searchInput"
                type="search"
                placeholder="搜尋操作者、對象或內容..."
                class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                @keyup.enter="applyFilters"
              />

              <button
                type="button"
                class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                @click="applyFilters"
              >
                搜尋
              </button>
            </div>
          </div>

          <div>
            <label
              for="audit-action"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              操作
            </label>

            <select
              id="audit-action"
              :value="auditLogStore.query.action ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleActionChange"
            >
              <option
                v-for="option in actionOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="audit-target"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              對象類型
            </label>

            <select
              id="audit-target"
              :value="auditLogStore.query.targetType ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleTargetChange"
            >
              <option
                v-for="option in targetOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              @click="clearFilters"
            >
              清除篩選
            </button>
          </div>
        </div>
      </section>

      <p
        class="mt-5 text-sm text-slate-600"
        aria-live="polite"
      >
        共
        <span class="font-semibold text-slate-900">
          {{ auditLogStore.pagination.total }}
        </span>
        筆紀錄
      </p>

      <ErrorState
        v-if="auditLogStore.error"
        class="mt-4"
        :message="auditLogStore.error"
        show-retry
        @retry="auditLogStore.fetchLogs()"
      />

      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <caption class="sr-only">
              稽核紀錄列表
            </caption>

            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  時間
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  操作者
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  操作
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  對象
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  詳細內容
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="auditLogStore.loading">
                <td colspan="5">
                  <LoadingState />
                </td>
              </tr>

              <tr v-else-if="auditLogStore.logs.length === 0">
                <td colspan="5">
                  <EmptyState
                    title="找不到符合條件的紀錄"
                    description="請調整搜尋條件或篩選條件"
                  />
                </td>
              </tr>

              <tr
                v-for="log in auditLogStore.logs"
                v-else
                :key="log.id"
                class="transition hover:bg-slate-50"
              >
                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatDateTime(log.createdAt) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                  {{ log.actorName }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    :label="AUDIT_ACTION_LABELS[log.action]"
                    :tone="AUDIT_ACTION_TONES[log.action]"
                  />
                </td>

                <td class="px-5 py-4 text-sm text-slate-700">
                  <p>{{ log.targetName }}</p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ AUDIT_TARGET_LABELS[log.targetType] }}
                    <template v-if="log.targetId !== null">
                      #{{ log.targetId }}
                    </template>
                  </p>
                </td>

                <td class="px-5 py-4 text-sm text-slate-600">
                  {{ log.details }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          v-if="!auditLogStore.loading && auditLogStore.pagination.totalPages > 0"
          :page="auditLogStore.pagination.page"
          :page-size="auditLogStore.pagination.pageSize"
          :total="auditLogStore.pagination.total"
          :total-pages="auditLogStore.pagination.totalPages"
          aria-label="稽核紀錄分頁"
          @update:page="goToPage"
        />
      </section>
    </div>
  </div>
</template>
