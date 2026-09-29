<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppPagination from '../../components/AppPagination.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import SortButton from '../../components/SortButton.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useJobStore } from '../../stores/job'
import { formatDate } from '../../utils/formatters'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_TONES,
  WORK_TYPE_LABELS,
  toOptions,
} from '../../utils/labels'

import type {
  Job,
  JobSortBy,
  JobStatus,
  SortOrder,
  WorkType,
} from '../../types/job'

const router = useRouter()
const jobStore = useJobStore()
const authStore = useAuthStore()

const canCreate = computed(() => authStore.can('job.create'))
const canUpdate = computed(() => authStore.can('job.update'))
const canDelete = computed(() => authStore.can('job.delete'))

// --------------------------------------------------
// Options
// --------------------------------------------------

const statusOptions = toOptions(JOB_STATUS_LABELS, '全部狀態')
const workTypeOptions = toOptions(WORK_TYPE_LABELS, '全部工作型態')
const pageSizeOptions = [5, 10, 20]

const departmentOptions = computed(() => {
  const departments = new Set(jobStore.jobs.map((job) => job.department))

  if (jobStore.query.department) {
    departments.add(jobStore.query.department)
  }

  return Array.from(departments)
})

// --------------------------------------------------
// Search / filter
// --------------------------------------------------

const searchInput = ref('')

function applyFilters() {
  jobStore.setQuery({
    search: searchInput.value.trim() || undefined,
    page: 1,
  })

  jobStore.fetchJobs()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  jobStore.setQuery({
    status: value ? (value as JobStatus) : undefined,
    page: 1,
  })

  jobStore.fetchJobs()
}

function handleDepartmentChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  jobStore.setQuery({
    department: value || undefined,
    page: 1,
  })

  jobStore.fetchJobs()
}

function handleWorkTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  jobStore.setQuery({
    workType: value ? (value as WorkType) : undefined,
    page: 1,
  })

  jobStore.fetchJobs()
}

function handlePageSizeChange(event: Event) {
  jobStore.setQuery({
    pageSize: Number((event.target as HTMLSelectElement).value),
    page: 1,
  })

  jobStore.fetchJobs()
}

function clearFilters() {
  searchInput.value = ''
  jobStore.resetQuery()
  jobStore.fetchJobs()
}

// --------------------------------------------------
// Sort
// --------------------------------------------------

const currentSortBy = computed<JobSortBy>(
  () => jobStore.query.sortBy ?? 'createdAt',
)

const currentSortOrder = computed<SortOrder>(
  () => jobStore.query.sortOrder ?? 'desc',
)

function toggleSort(sortBy: JobSortBy) {
  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy.value === sortBy) {
    nextSortOrder = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  jobStore.setQuery({ sortBy, sortOrder: nextSortOrder, page: 1 })
  jobStore.fetchJobs()
}

const sortableColumns: Array<{ key: JobSortBy; label: string }> = [
  { key: 'title', label: '職缺名稱' },
  { key: 'department', label: '部門' },
]

// --------------------------------------------------
// Pagination
// --------------------------------------------------

function goToPage(page: number) {
  jobStore.setQuery({ page })
  jobStore.fetchJobs()
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const jobToDelete = ref<Job | null>(null)

function askDelete(job: Job) {
  jobToDelete.value = job
}

async function confirmDelete() {
  if (!jobToDelete.value) {
    return
  }

  const success = await jobStore.deleteJob(jobToDelete.value.id)

  jobToDelete.value = null

  if (success) {
    // 若目前頁面被刪空，退回上一頁
    if (jobStore.jobs.length === 1 && (jobStore.query.page ?? 1) > 1) {
      jobStore.setQuery({ page: (jobStore.query.page ?? 1) - 1 })
    }

    jobStore.fetchJobs()
  }
}

// --------------------------------------------------
// Navigation
// --------------------------------------------------

function viewJob(job: Job) {
  router.push({ name: 'job-detail', params: { id: job.id } })
}

function editJob(job: Job) {
  router.push({ name: 'job-edit', params: { id: job.id } })
}

onMounted(() => {
  searchInput.value = jobStore.query.search ?? ''
  jobStore.fetchJobs()
})
</script>

<template>
  <div>
    <PageHeader
      title="職缺管理"
      description="管理企業目前的職缺資料"
    >
      <template #actions>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'job-create' }"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          ＋ 建立職缺
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-6 py-6">
      <!-- Filters -->
      <section
        aria-labelledby="job-filter-title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="job-filter-title"
          class="sr-only"
        >
          搜尋與篩選
        </h2>

        <div class="grid gap-4 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <label
              for="job-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋職缺
            </label>

            <div class="flex gap-2">
              <input
                id="job-search"
                v-model="searchInput"
                type="search"
                placeholder="搜尋職缺名稱或描述..."
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
              for="job-status"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              狀態
            </label>

            <select
              id="job-status"
              :value="jobStore.query.status ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleStatusChange"
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

          <div>
            <label
              for="job-department"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              部門
            </label>

            <select
              id="job-department"
              :value="jobStore.query.department ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleDepartmentChange"
            >
              <option value="">
                全部部門
              </option>

              <option
                v-for="department in departmentOptions"
                :key="department"
                :value="department"
              >
                {{ department }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="job-work-type"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              工作型態
            </label>

            <select
              id="job-work-type"
              :value="jobStore.query.workType ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleWorkTypeChange"
            >
              <option
                v-for="option in workTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="job-page-size"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              每頁筆數
            </label>

            <select
              id="job-page-size"
              :value="jobStore.pagination.pageSize"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handlePageSizeChange"
            >
              <option
                v-for="size in pageSizeOptions"
                :key="size"
                :value="size"
              >
                {{ size }} 筆
              </option>
            </select>
          </div>

          <div class="flex items-end lg:col-span-2">
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

      <!-- Summary -->
      <div
        class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          class="text-sm text-slate-600"
          aria-live="polite"
        >
          共
          <span class="font-semibold text-slate-900">
            {{ jobStore.pagination.total }}
          </span>
          筆職缺
        </p>

        <p
          v-if="jobStore.pagination.totalPages > 0"
          class="text-sm text-slate-500"
        >
          第 {{ jobStore.pagination.page }} / {{ jobStore.pagination.totalPages }} 頁
        </p>
      </div>

      <ErrorState
        v-if="jobStore.error"
        class="mt-4"
        :message="jobStore.error"
        show-retry
        @retry="jobStore.fetchJobs()"
      />

      <ErrorState
        v-if="jobStore.deleteError"
        class="mt-4"
        :message="jobStore.deleteError"
      />

      <!-- Table -->
      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <caption class="sr-only">
              職缺列表
            </caption>

            <thead class="bg-slate-50">
              <tr>
                <th
                  v-for="column in sortableColumns"
                  :key="column.key"
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="
                    currentSortBy === column.key
                      ? currentSortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  "
                >
                  <SortButton
                    :label="column.label"
                    :active="currentSortBy === column.key"
                    :order="currentSortOrder"
                    @toggle="toggleSort(column.key)"
                  />
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  地點
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  工作型態
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
                  :aria-sort="
                    currentSortBy === 'createdAt'
                      ? currentSortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  "
                >
                  <SortButton
                    label="建立時間"
                    :active="currentSortBy === 'createdAt'"
                    :order="currentSortOrder"
                    @toggle="toggleSort('createdAt')"
                  />
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="
                    currentSortBy === 'updatedAt'
                      ? currentSortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  "
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
              <tr v-if="jobStore.loading">
                <td colspan="8">
                  <LoadingState />
                </td>
              </tr>

              <tr v-else-if="jobStore.jobs.length === 0">
                <td colspan="8">
                  <EmptyState
                    title="找不到符合條件的職缺"
                    description="請調整搜尋條件或篩選條件"
                  />
                </td>
              </tr>

              <tr
                v-for="job in jobStore.jobs"
                v-else
                :key="job.id"
                class="transition hover:bg-slate-50"
              >
                <td class="px-5 py-4">
                  <RouterLink
                    :to="{ name: 'job-detail', params: { id: job.id } }"
                    class="font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {{ job.title }}
                  </RouterLink>

                  <p class="mt-1 max-w-xs truncate text-xs text-slate-500">
                    {{ job.description }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ job.department }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ job.location }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ WORK_TYPE_LABELS[job.workType] }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    :label="JOB_STATUS_LABELS[job.status]"
                    :tone="JOB_STATUS_TONES[job.status]"
                  />
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatDate(job.createdAt) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatDate(job.updatedAt) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      @click="viewJob(job)"
                    >
                      查看
                      <span class="sr-only">{{ job.title }}</span>
                    </button>

                    <button
                      v-if="canUpdate"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @click="editJob(job)"
                    >
                      編輯
                      <span class="sr-only">{{ job.title }}</span>
                    </button>

                    <button
                      v-if="canDelete"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="jobStore.deleteLoading"
                      @click="askDelete(job)"
                    >
                      刪除
                      <span class="sr-only">{{ job.title }}</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          v-if="!jobStore.loading && jobStore.pagination.totalPages > 0"
          :page="jobStore.pagination.page"
          :page-size="jobStore.pagination.pageSize"
          :total="jobStore.pagination.total"
          :total-pages="jobStore.pagination.totalPages"
          aria-label="職缺列表分頁"
          @update:page="goToPage"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="jobToDelete !== null"
      title="刪除職缺"
      :message="`確定要刪除職缺「${jobToDelete?.title ?? ''}」嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="jobStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="jobToDelete = null"
    />
  </div>
</template>
