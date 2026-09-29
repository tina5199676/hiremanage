<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../../stores/job'

import type {
  Job,
  JobSortBy,
  JobStatus,
  SortOrder,
  WorkType,
} from '../../types/job'

const jobStore = useJobStore()
const router = useRouter()
function viewJob(job: Job) {
  router.push(
    `/admin/jobs/${job.id}`,
  )
}

function editJob(job: Job) {
  router.push(
    `/admin/jobs/${job.id}/edit`,
  )
}

const deletingJobId = ref<number | null>(
  null,
)

async function deleteJob(job: Job) {
  const confirmed = window.confirm(
    `確定要刪除職缺「${job.title}」嗎？此動作無法復原。`,
  )

  if (!confirmed) {
    return
  }

  deletingJobId.value = job.id

  const success =
    await jobStore.deleteJob(job.id)

  deletingJobId.value = null

  if (success) {
    jobStore.fetchJobs()
  }
}

function goToCreateJob() {
  router.push('/admin/jobs/create')
}
// --------------------------------------------------
// Search
// --------------------------------------------------

const searchInput = ref('')

// --------------------------------------------------
// Filter options
// --------------------------------------------------

const statusOptions: Array<{
  label: string
  value: JobStatus
}> = [
  {
    label: '全部狀態',
    value: '' as JobStatus,
  },
  {
    label: '開放中',
    value: 'open',
  },
  {
    label: '草稿',
    value: 'draft',
  },
  {
    label: '已關閉',
    value: 'closed',
  },
]

const workTypeOptions: Array<{
  label: string
  value: WorkType
}> = [
  {
    label: '全部工作型態',
    value: '' as WorkType,
  },
  {
    label: 'On-site',
    value: 'onsite',
  },
  {
    label: 'Remote',
    value: 'remote',
  },
  {
    label: 'Hybrid',
    value: 'hybrid',
  },
]

// --------------------------------------------------
// Department options
// --------------------------------------------------

const departmentOptions = computed(() => {
  const departments = new Set(
    jobStore.jobs.map((job) => job.department),
  )

  return [
    '全部部門',
    ...Array.from(departments),
  ]
})

// --------------------------------------------------
// Pagination
// --------------------------------------------------

const pageSizeOptions = [5, 10, 20]

const currentPage = computed(() => {
  return jobStore.pagination.page
})

const pageSize = computed(() => {
  return jobStore.pagination.pageSize
})

const totalItems = computed(() => {
  return jobStore.pagination.total
})

const totalPages = computed(() => {
  return jobStore.pagination.totalPages
})

// --------------------------------------------------
// Sort
// --------------------------------------------------

const currentSortBy = computed<JobSortBy>(() => {
  return jobStore.query.sortBy ?? 'createdAt'
})

const currentSortOrder = computed<SortOrder>(() => {
  return jobStore.query.sortOrder ?? 'desc'
})

// --------------------------------------------------
// Search / Filter
// --------------------------------------------------

function applyFilters() {
  jobStore.setQuery({
    search:
      searchInput.value.trim() || undefined,

    page: 1,
  })

  jobStore.fetchJobs()
}

function handleStatusChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const value = target.value

  jobStore.setQuery({
    status:
      value
        ? (value as JobStatus)
        : undefined,

    page: 1,
  })

  jobStore.fetchJobs()
}

function handleDepartmentChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const value = target.value

  jobStore.setQuery({
    department:
      value && value !== '全部部門'
        ? value
        : undefined,

    page: 1,
  })

  jobStore.fetchJobs()
}

function handleWorkTypeChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const value = target.value

  jobStore.setQuery({
    workType:
      value
        ? (value as WorkType)
        : undefined,

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

function toggleSort(
  sortBy: JobSortBy,
) {
  const currentSortBy =
    jobStore.query.sortBy

  const currentSortOrder =
    jobStore.query.sortOrder

  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy === sortBy) {
    nextSortOrder =
      currentSortOrder === 'asc'
        ? 'desc'
        : 'asc'
  }

  jobStore.setQuery({
    sortBy,
    sortOrder: nextSortOrder,
    page: 1,
  })

  jobStore.fetchJobs()
}

// --------------------------------------------------
// Pagination
// --------------------------------------------------

function goToPage(page: number) {
  if (
    page < 1 ||
    page > totalPages.value ||
    page === currentPage.value
  ) {
    return
  }

  jobStore.setQuery({
    page,
  })

  jobStore.fetchJobs()
}

function handlePageSizeChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const newPageSize =
    Number(target.value)

  jobStore.setQuery({
    pageSize: newPageSize,
    page: 1,
  })

  jobStore.fetchJobs()
}

// --------------------------------------------------
// Pagination page numbers
// --------------------------------------------------

const visiblePages = computed(() => {
  const pages: number[] = []

  const total = totalPages.value
  const current = currentPage.value

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
  const end = Math.min(
    total - 1,
    current + 1,
  )

  for (
    let page = start;
    page <= end;
    page += 1
  ) {
    pages.push(page)
  }

  if (current < total - 3) {
    pages.push(-1)
  }

  pages.push(total)

  return pages
})

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getStatusLabel(
  status: JobStatus,
) {
  switch (status) {
    case 'open':
      return '開放中'

    case 'draft':
      return '草稿'

    case 'closed':
      return '已關閉'

    default:
      return status
  }
}

function getStatusClass(
  status: JobStatus,
) {
  switch (status) {
    case 'open':
      return 'bg-emerald-50 text-emerald-700'

    case 'draft':
      return 'bg-amber-50 text-amber-700'

    case 'closed':
      return 'bg-slate-100 text-slate-600'

    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getWorkTypeLabel(
  workType: WorkType,
) {
  switch (workType) {
    case 'onsite':
      return 'On-site'

    case 'remote':
      return 'Remote'

    case 'hybrid':
      return 'Hybrid'

    default:
      return workType
  }
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(new Date(value))
}

function getSortIcon(
  sortBy: JobSortBy,
) {
  if (currentSortBy.value !== sortBy) {
    return '↕'
  }

  return currentSortOrder.value === 'asc'
    ? '↑'
    : '↓'
}

function getSortButtonLabel(
  sortBy: JobSortBy,
) {
  if (currentSortBy.value !== sortBy) {
    return '點擊排序'
  }

  return currentSortOrder.value === 'asc'
    ? '目前為升冪排序，點擊切換為降冪'
    : '目前為降冪排序，點擊切換為升冪'
}

// --------------------------------------------------
// Initial fetch
// --------------------------------------------------

onMounted(() => {
  jobStore.fetchJobs()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <header
      class="border-b border-slate-200 bg-white"
    >
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
      >
        <div>
          <h1
            class="text-2xl font-bold text-slate-900"
          >
            職缺管理
          </h1>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            管理企業目前的職缺資料
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          @click="goToCreateJob"
        >
          ＋ 建立職缺
        </button>
      </div>
    </header>

    <div
      class="mx-auto max-w-7xl px-6 py-6"
    >
      <!-- Search / Filters -->
      <section
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div
          class="grid gap-4 lg:grid-cols-4"
        >
          <!-- Search -->
          <div
            class="lg:col-span-2"
          >
            <label
              for="job-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋職缺
            </label>

            <div
              class="flex gap-2"
            >
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

          <!-- Status -->
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
                :key="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Department -->
          <div>
            <label
              for="job-department"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              部門
            </label>

            <select
              id="job-department"
              :value="
                jobStore.query.department ??
                '全部部門'
              "
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleDepartmentChange"
            >
              <option
                v-for="department in departmentOptions"
                :key="department"
                :value="department"
              >
                {{ department }}
              </option>
            </select>
          </div>

          <!-- Work type -->
          <div>
            <label
              for="job-work-type"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              工作型態
            </label>

            <select
              id="job-work-type"
              :value="
                jobStore.query.workType ?? ''
              "
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleWorkTypeChange"
            >
              <option
                v-for="option in workTypeOptions"
                :key="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Page size -->
          <div>
            <label
              for="job-page-size"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              每頁筆數
            </label>

            <select
              id="job-page-size"
              :value="pageSize"
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

          <!-- Clear -->
          <div
            class="flex items-end"
          >
            <button
              type="button"
              class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              @click="clearFilters"
            >
              清除篩選
            </button>
          </div>
        </div>
      </section>

      <!-- Result summary -->
      <div
        class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          class="text-sm text-slate-600"
        >
          共
          <span
            class="font-semibold text-slate-900"
          >
            {{ totalItems }}
          </span>
          筆職缺
        </p>

        <p
          v-if="totalPages > 0"
          class="text-sm text-slate-500"
        >
          第 {{ currentPage }} /
          {{ totalPages }} 頁
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="jobStore.error"
        class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ jobStore.error }}
      </div>

      <!-- Delete error -->
      <div
        v-if="jobStore.deleteError"
        class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ jobStore.deleteError }}
      </div>

      <!-- Table -->
      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class="overflow-x-auto"
        >
          <table
            class="min-w-full divide-y divide-slate-200"
          >
            <thead
              class="bg-slate-50"
            >
              <tr>
                <!-- Job title -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    :aria-label="
                      getSortButtonLabel('title')
                    "
                    @click="toggleSort('title')"
                  >
                    職缺名稱

                    <span
                      aria-hidden="true"
                      class="text-sm"
                    >
                      {{ getSortIcon('title') }}
                    </span>
                  </button>
                </th>

                <!-- Department -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    :aria-label="
                      getSortButtonLabel(
                        'department',
                      )
                    "
                    @click="
                      toggleSort(
                        'department',
                      )
                    "
                  >
                    部門

                    <span
                      aria-hidden="true"
                      class="text-sm"
                    >
                      {{
                        getSortIcon(
                          'department',
                        )
                      }}
                    </span>
                  </button>
                </th>

                <!-- Location -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  地點
                </th>

                <!-- Work type -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  工作型態
                </th>

                <!-- Status -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  狀態
                </th>

                <!-- Created at -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    :aria-label="
                      getSortButtonLabel(
                        'createdAt',
                      )
                    "
                    @click="
                      toggleSort(
                        'createdAt',
                      )
                    "
                  >
                    建立時間

                    <span
                      aria-hidden="true"
                      class="text-sm"
                    >
                      {{
                        getSortIcon(
                          'createdAt',
                        )
                      }}
                    </span>
                  </button>
                </th>

                <!-- Updated at -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    :aria-label="
                      getSortButtonLabel(
                        'updatedAt',
                      )
                    "
                    @click="
                      toggleSort(
                        'updatedAt',
                      )
                    "
                  >
                    更新時間

                    <span
                      aria-hidden="true"
                      class="text-sm"
                    >
                      {{
                        getSortIcon(
                          'updatedAt',
                        )
                      }}
                    </span>
                  </button>
                </th>

                <!-- Actions -->
                <th
                  scope="col"
                  class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  操作
                </th>
              </tr>
            </thead>

            <tbody
              class="divide-y divide-slate-200 bg-white"
            >
              <!-- Loading -->
              <tr
                v-if="jobStore.loading"
              >
                <td
                  colspan="8"
                  class="px-5 py-12 text-center text-sm text-slate-500"
                >
                  載入中...
                </td>
              </tr>

              <!-- Empty -->
              <tr
                v-else-if="
                  jobStore.jobs.length === 0
                "
              >
                <td
                  colspan="8"
                  class="px-5 py-12 text-center"
                >
                  <p
                    class="text-sm font-medium text-slate-700"
                  >
                    找不到符合條件的職缺
                  </p>

                  <p
                    class="mt-1 text-sm text-slate-500"
                  >
                    請調整搜尋條件或篩選條件
                  </p>
                </td>
              </tr>

              <!-- Data -->
              <tr
                v-for="job in jobStore.jobs"
                v-else
                :key="job.id"
                class="transition hover:bg-slate-50"
              >
                <!-- Title -->
                <td
                  class="whitespace-nowrap px-5 py-4"
                >
                  <div>
                    <p
                      class="font-medium text-slate-900"
                    >
                      {{ job.title }}
                    </p>

                    <p
                      class="mt-1 max-w-xs truncate text-xs text-slate-500"
                    >
                      {{ job.description }}
                    </p>
                  </div>
                </td>

                <!-- Department -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  {{ job.department }}
                </td>

                <!-- Location -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  {{ job.location }}
                </td>

                <!-- Work type -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  {{
                    getWorkTypeLabel(
                      job.workType,
                    )
                  }}
                </td>

                <!-- Status -->
                <td
                  class="whitespace-nowrap px-5 py-4"
                >
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      getStatusClass(
                        job.status,
                      )
                    "
                  >
                    {{
                      getStatusLabel(
                        job.status,
                      )
                    }}
                  </span>
                </td>

                <!-- Created -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-600"
                >
                  {{
                    formatDate(
                      job.createdAt,
                    )
                  }}
                </td>

                <!-- Updated -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-600"
                >
                  {{
                    formatDate(
                      job.updatedAt,
                    )
                  }}
                </td>

                <!-- Actions -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-right"
                >
                  <div
                    class="flex justify-end gap-2"
                  >
                    <button
                    type="button"
                    class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    @click="viewJob(job)"
                    >
                    查看
                    </button>

                    <button
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @click="editJob(job)"
                    >
                      編輯
                    </button>

                    <button
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="deletingJobId === job.id"
                      @click="deleteJob(job)"
                    >
                      {{
                        deletingJobId === job.id
                          ? '刪除中...'
                          : '刪除'
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="
            !jobStore.loading &&
            totalPages > 0
          "
          class="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Result info -->
          <p
            class="text-sm text-slate-500"
          >
            顯示
            <span
              class="font-medium text-slate-700"
            >
              {{
                (currentPage - 1) *
                  pageSize +
                1
              }}
            </span>
            -
            <span
              class="font-medium text-slate-700"
            >
              {{
                Math.min(
                  currentPage *
                    pageSize,
                  totalItems,
                )
              }}
            </span>
            筆，共
            <span
              class="font-medium text-slate-700"
            >
              {{ totalItems }}
            </span>
            筆
          </p>

          <!-- Page controls -->
          <nav
            aria-label="職缺列表分頁"
            class="flex items-center gap-1"
          >
            <!-- Previous -->
            <button
              type="button"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="
                goToPage(
                  currentPage - 1,
                )
              "
            >
              上一頁
            </button>

            <!-- Pages -->
            <template
              v-for="(
                page, index
              ) in visiblePages"
              :key="`${page}-${index}`"
            >
              <span
                v-if="page === -1"
                class="px-2 text-sm text-slate-400"
              >
                …
              </span>

              <button
                v-else
                type="button"
                class="min-w-9 rounded-md border px-3 py-2 text-sm font-medium transition"
                :class="
                  page === currentPage
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                "
                :aria-current="
                  page === currentPage
                    ? 'page'
                    : undefined
                "
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </template>

            <!-- Next -->
            <button
              type="button"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="
                currentPage === totalPages
              "
              @click="
                goToPage(
                  currentPage + 1,
                )
              "
            >
              下一頁
            </button>
          </nav>
        </div>
      </section>
    </div>
  </main>
</template>