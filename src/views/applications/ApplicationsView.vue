<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import ApplicationCard from '../../components/ApplicationCard.vue'
import AppPagination from '../../components/AppPagination.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import SortButton from '../../components/SortButton.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useApplicationStore } from '../../stores/application'
import { useAuthStore } from '../../stores/auth'
import { formatDate } from '../../utils/formatters'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_STATUS_TONES,
  toOptions,
} from '../../utils/labels'

import type {
  Application,
  ApplicationSortBy,
  ApplicationStatus,
} from '../../types/application'
import type { SortOrder } from '../../types/common'

type ViewMode = 'board' | 'list'

const applicationStore = useApplicationStore()
const authStore = useAuthStore()

const canCreate = computed(() => authStore.can('application.create'))
const canUpdate = computed(() => authStore.can('application.update'))
const canDelete = computed(() => authStore.can('application.delete'))

// --------------------------------------------------
// View mode
// --------------------------------------------------

const viewMode = ref<ViewMode>('board')

const viewModes: Array<{ value: ViewMode; label: string }> = [
  { value: 'board', label: '看板' },
  { value: 'list', label: '列表' },
]

watch(viewMode, (mode) => {
  if (mode === 'board') {
    applicationStore.fetchBoard()
  } else {
    applicationStore.fetchApplications()
  }
})

// --------------------------------------------------
// Board
// --------------------------------------------------

const columns = computed(() =>
  APPLICATION_STATUS_ORDER.map((status) => ({
    status,
    label: APPLICATION_STATUS_LABELS[status],
    tone: APPLICATION_STATUS_TONES[status],
    items: applicationStore.board[status] ?? [],
  })),
)

const boardTotal = computed(() =>
  columns.value.reduce((sum, column) => sum + column.items.length, 0),
)

function changeStatus(application: Application, status: ApplicationStatus) {
  applicationStore.updateStatus(application.id, status)
}

// --------------------------------------------------
// List
// --------------------------------------------------

const statusOptions = toOptions(APPLICATION_STATUS_LABELS, '全部狀態')
const searchInput = ref('')

function applyFilters() {
  applicationStore.setQuery({
    search: searchInput.value.trim() || undefined,
    page: 1,
  })

  applicationStore.fetchApplications()
}

function handleStatusFilter(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  applicationStore.setQuery({
    status: value ? (value as ApplicationStatus) : undefined,
    page: 1,
  })

  applicationStore.fetchApplications()
}

function clearFilters() {
  searchInput.value = ''
  applicationStore.resetQuery()
  applicationStore.fetchApplications()
}

const currentSortBy = computed<ApplicationSortBy>(
  () => applicationStore.query.sortBy ?? 'appliedAt',
)

const currentSortOrder = computed<SortOrder>(
  () => applicationStore.query.sortOrder ?? 'desc',
)

function toggleSort(sortBy: ApplicationSortBy) {
  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy.value === sortBy) {
    nextSortOrder = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  applicationStore.setQuery({ sortBy, sortOrder: nextSortOrder, page: 1 })
  applicationStore.fetchApplications()
}

function ariaSort(key: ApplicationSortBy) {
  if (currentSortBy.value !== key) {
    return 'none'
  }

  return currentSortOrder.value === 'asc' ? 'ascending' : 'descending'
}

function goToPage(page: number) {
  applicationStore.setQuery({ page })
  applicationStore.fetchApplications()
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const applicationToDelete = ref<Application | null>(null)

async function confirmDelete() {
  if (!applicationToDelete.value) {
    return
  }

  const success = await applicationStore.deleteApplication(
    applicationToDelete.value.id,
  )

  applicationToDelete.value = null

  if (success) {
    applicationStore.fetchApplications()
  }
}

onMounted(() => {
  applicationStore.fetchBoard()
})
</script>

<template>
  <div>
    <PageHeader
      title="應徵管理"
      description="以看板追蹤每位候選人的招聘進度"
    >
      <template #actions>
        <div
          role="group"
          aria-label="切換顯示模式"
          class="inline-flex rounded-lg border border-slate-300 p-0.5"
        >
          <button
            v-for="mode in viewModes"
            :key="mode.value"
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-500"
            :class="
              viewMode === mode.value
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            "
            :aria-pressed="viewMode === mode.value"
            @click="viewMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>

        <RouterLink
          v-if="canCreate"
          :to="{ name: 'application-create' }"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          ＋ 建立應徵
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-6 py-6">
      <ErrorState
        v-if="applicationStore.updateError"
        class="mb-4"
        :message="applicationStore.updateError"
      />

      <!-- Board -->
      <template v-if="viewMode === 'board'">
        <p
          class="text-sm text-slate-600"
          aria-live="polite"
        >
          共
          <span class="font-semibold text-slate-900">{{ boardTotal }}</span>
          筆應徵
        </p>

        <section
          v-if="applicationStore.boardLoading"
          class="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <LoadingState message="載入看板中..." />
        </section>

        <ErrorState
          v-else-if="applicationStore.boardError"
          class="mt-4"
          :message="applicationStore.boardError"
          show-retry
          @retry="applicationStore.fetchBoard()"
        />

        <div
          v-else
          class="mt-4 flex gap-4 overflow-x-auto pb-4 xl:grid xl:grid-cols-6 xl:overflow-visible"
        >
          <section
            v-for="column in columns"
            :key="column.status"
            class="flex w-64 flex-shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100 xl:w-auto"
            :aria-labelledby="`column-${column.status}`"
          >
            <header class="flex items-center justify-between px-3 py-3">
              <h2
                :id="`column-${column.status}`"
                class="flex items-center gap-2 text-sm font-semibold text-slate-800"
              >
                <StatusBadge
                  :label="column.label"
                  :tone="column.tone"
                />
              </h2>

              <span class="text-xs font-medium text-slate-500">
                {{ column.items.length }}
              </span>
            </header>

            <ul class="flex-1 space-y-2 px-3 pb-3">
              <li
                v-if="column.items.length === 0"
                class="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400"
              >
                目前沒有資料
              </li>

              <li
                v-for="application in column.items"
                :key="application.id"
              >
                <ApplicationCard
                  :application="application"
                  :can-update="canUpdate"
                  :updating="applicationStore.statusUpdatingId === application.id"
                  @change-status="changeStatus(application, $event)"
                />
              </li>
            </ul>
          </section>
        </div>
      </template>

      <!-- List -->
      <template v-else>
        <section
          aria-labelledby="application-filter-title"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2
            id="application-filter-title"
            class="sr-only"
          >
            搜尋與篩選
          </h2>

          <div class="grid gap-4 lg:grid-cols-4">
            <div class="lg:col-span-2">
              <label
                for="application-search"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                搜尋
              </label>

              <div class="flex gap-2">
                <input
                  id="application-search"
                  v-model="searchInput"
                  type="search"
                  placeholder="搜尋候選人或職缺..."
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
                for="application-status"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                狀態
              </label>

              <select
                id="application-status"
                :value="applicationStore.query.status ?? ''"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                @change="handleStatusFilter"
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
            {{ applicationStore.pagination.total }}
          </span>
          筆應徵
        </p>

        <ErrorState
          v-if="applicationStore.error"
          class="mt-4"
          :message="applicationStore.error"
          show-retry
          @retry="applicationStore.fetchApplications()"
        />

        <ErrorState
          v-if="applicationStore.deleteError"
          class="mt-4"
          :message="applicationStore.deleteError"
        />

        <section
          class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <caption class="sr-only">
                應徵列表
              </caption>

              <thead class="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    :aria-sort="ariaSort('candidateName')"
                  >
                    <SortButton
                      label="候選人"
                      :active="currentSortBy === 'candidateName'"
                      :order="currentSortOrder"
                      @toggle="toggleSort('candidateName')"
                    />
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    職缺
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    狀態
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    :aria-sort="ariaSort('appliedAt')"
                  >
                    <SortButton
                      label="應徵日期"
                      :active="currentSortBy === 'appliedAt'"
                      :order="currentSortOrder"
                      @toggle="toggleSort('appliedAt')"
                    />
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    :aria-sort="ariaSort('updatedAt')"
                  >
                    <SortButton
                      label="更新時間"
                      :active="currentSortBy === 'updatedAt'"
                      :order="currentSortOrder"
                      @toggle="toggleSort('updatedAt')"
                    />
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    操作
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-200 bg-white">
                <tr v-if="applicationStore.loading">
                  <td colspan="6">
                    <LoadingState />
                  </td>
                </tr>

                <tr v-else-if="applicationStore.applications.length === 0">
                  <td colspan="6">
                    <EmptyState
                      title="找不到符合條件的應徵紀錄"
                      description="請調整搜尋條件或篩選條件"
                    />
                  </td>
                </tr>

                <tr
                  v-for="application in applicationStore.applications"
                  v-else
                  :key="application.id"
                  class="transition hover:bg-slate-50"
                >
                  <td class="whitespace-nowrap px-5 py-4">
                    <RouterLink
                      :to="{ name: 'application-detail', params: { id: application.id } }"
                      class="rounded font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {{ application.candidateName }}
                    </RouterLink>
                  </td>

                  <td class="px-5 py-4 text-sm text-slate-700">
                    <p>{{ application.jobTitle }}</p>

                    <p class="mt-1 text-xs text-slate-500">
                      {{ application.jobDepartment }}
                    </p>
                  </td>

                  <td class="whitespace-nowrap px-5 py-4">
                    <StatusBadge
                      :label="APPLICATION_STATUS_LABELS[application.status]"
                      :tone="APPLICATION_STATUS_TONES[application.status]"
                    />
                  </td>

                  <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {{ formatDate(application.appliedAt) }}
                  </td>

                  <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {{ formatDate(application.updatedAt) }}
                  </td>

                  <td class="whitespace-nowrap px-5 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <RouterLink
                        :to="{ name: 'application-detail', params: { id: application.id } }"
                        class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        查看
                        <span class="sr-only">{{ application.candidateName }}</span>
                      </RouterLink>

                      <button
                        v-if="canDelete"
                        type="button"
                        class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="applicationStore.deleteLoading"
                        @click="applicationToDelete = application"
                      >
                        刪除
                        <span class="sr-only">{{ application.candidateName }}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <AppPagination
            v-if="!applicationStore.loading && applicationStore.pagination.totalPages > 0"
            :page="applicationStore.pagination.page"
            :page-size="applicationStore.pagination.pageSize"
            :total="applicationStore.pagination.total"
            :total-pages="applicationStore.pagination.totalPages"
            aria-label="應徵列表分頁"
            @update:page="goToPage"
          />
        </section>
      </template>
    </div>

    <ConfirmDialog
      :open="applicationToDelete !== null"
      title="刪除應徵紀錄"
      :message="`確定要刪除「${applicationToDelete?.candidateName ?? ''} - ${applicationToDelete?.jobTitle ?? ''}」的應徵紀錄嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="applicationStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="applicationToDelete = null"
    />
  </div>
</template>
