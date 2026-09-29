<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateStore } from '../../stores/candidate'

import type {
  Candidate,
  CandidateSortBy,
  CandidateSource,
  CandidateStatus,
  SortOrder,
} from '../../types/candidate'

const candidateStore = useCandidateStore()
const router = useRouter()

function viewCandidate(candidate: Candidate) {
  router.push(
    `/admin/candidates/${candidate.id}`,
  )
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
  value: CandidateStatus
}> = [
  {
    label: '全部狀態',
    value: '' as CandidateStatus,
  },
  {
    label: '在職應徵中',
    value: 'active',
  },
  {
    label: '未在聯繫',
    value: 'inactive',
  },
  {
    label: '已錄取',
    value: 'hired',
  },
]

const sourceOptions: Array<{
  label: string
  value: CandidateSource
}> = [
  {
    label: '全部來源',
    value: '' as CandidateSource,
  },
  {
    label: 'Referral',
    value: 'referral',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin',
  },
  {
    label: 'Job Board',
    value: 'job-board',
  },
  {
    label: 'Career Site',
    value: 'career-site',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

// --------------------------------------------------
// Pagination
// --------------------------------------------------

const pageSizeOptions = [5, 10, 20]

const currentPage = computed(() => {
  return candidateStore.pagination.page
})

const pageSize = computed(() => {
  return candidateStore.pagination.pageSize
})

const totalItems = computed(() => {
  return candidateStore.pagination.total
})

const totalPages = computed(() => {
  return candidateStore.pagination.totalPages
})

// --------------------------------------------------
// Sort
// --------------------------------------------------

const currentSortBy = computed<CandidateSortBy>(() => {
  return candidateStore.query.sortBy ?? 'createdAt'
})

const currentSortOrder = computed<SortOrder>(() => {
  return candidateStore.query.sortOrder ?? 'desc'
})

// --------------------------------------------------
// Search / Filter
// --------------------------------------------------

function applyFilters() {
  candidateStore.setQuery({
    search:
      searchInput.value.trim() || undefined,

    page: 1,
  })

  candidateStore.fetchCandidates()
}

function handleStatusChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const value = target.value

  candidateStore.setQuery({
    status:
      value
        ? (value as CandidateStatus)
        : undefined,

    page: 1,
  })

  candidateStore.fetchCandidates()
}

function handleSourceChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const value = target.value

  candidateStore.setQuery({
    source:
      value
        ? (value as CandidateSource)
        : undefined,

    page: 1,
  })

  candidateStore.fetchCandidates()
}

function clearFilters() {
  searchInput.value = ''

  candidateStore.resetQuery()

  candidateStore.fetchCandidates()
}

// --------------------------------------------------
// Sort
// --------------------------------------------------

function toggleSort(
  sortBy: CandidateSortBy,
) {
  const currentSortBy =
    candidateStore.query.sortBy

  const currentSortOrder =
    candidateStore.query.sortOrder

  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy === sortBy) {
    nextSortOrder =
      currentSortOrder === 'asc'
        ? 'desc'
        : 'asc'
  }

  candidateStore.setQuery({
    sortBy,
    sortOrder: nextSortOrder,
    page: 1,
  })

  candidateStore.fetchCandidates()
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

  candidateStore.setQuery({
    page,
  })

  candidateStore.fetchCandidates()
}

function handlePageSizeChange(
  event: Event,
) {
  const target =
    event.target as HTMLSelectElement

  const newPageSize =
    Number(target.value)

  candidateStore.setQuery({
    pageSize: newPageSize,
    page: 1,
  })

  candidateStore.fetchCandidates()
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
  status: CandidateStatus,
) {
  switch (status) {
    case 'active':
      return '在職應徵中'

    case 'inactive':
      return '未在聯繫'

    case 'hired':
      return '已錄取'

    default:
      return status
  }
}

function getStatusClass(
  status: CandidateStatus,
) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'

    case 'inactive':
      return 'bg-slate-100 text-slate-600'

    case 'hired':
      return 'bg-blue-50 text-blue-700'

    default:
      return 'bg-slate-100 text-slate-600'
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
  sortBy: CandidateSortBy,
) {
  if (currentSortBy.value !== sortBy) {
    return '↕'
  }

  return currentSortOrder.value === 'asc'
    ? '↑'
    : '↓'
}

function getSortButtonLabel(
  sortBy: CandidateSortBy,
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
  candidateStore.fetchCandidates()
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
            候選人管理
          </h1>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            管理企業目前的候選人資料
          </p>
        </div>
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
              for="candidate-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋候選人
            </label>

            <div
              class="flex gap-2"
            >
              <input
                id="candidate-search"
                v-model="searchInput"
                type="search"
                placeholder="搜尋姓名或 Email..."
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
              for="candidate-status"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              狀態
            </label>

            <select
              id="candidate-status"
              :value="candidateStore.query.status ?? ''"
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

          <!-- Source -->
          <div>
            <label
              for="candidate-source"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              來源
            </label>

            <select
              id="candidate-source"
              :value="candidateStore.query.source ?? ''"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @change="handleSourceChange"
            >
              <option
                v-for="option in sourceOptions"
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
              for="candidate-page-size"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              每頁筆數
            </label>

            <select
              id="candidate-page-size"
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
          位候選人
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
        v-if="candidateStore.error"
        class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ candidateStore.error }}
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
                <!-- Name -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded px-1 py-1 text-left transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    :aria-label="
                      getSortButtonLabel('name')
                    "
                    @click="toggleSort('name')"
                  >
                    姓名

                    <span
                      aria-hidden="true"
                      class="text-sm"
                    >
                      {{ getSortIcon('name') }}
                    </span>
                  </button>
                </th>

                <!-- Current title -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  目前職稱
                </th>

                <!-- Location -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  地點
                </th>

                <!-- Source -->
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  來源
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
                v-if="candidateStore.loading"
              >
                <td
                  colspan="7"
                  class="px-5 py-12 text-center text-sm text-slate-500"
                >
                  載入中...
                </td>
              </tr>

              <!-- Empty -->
              <tr
                v-else-if="
                  candidateStore.candidates.length === 0
                "
              >
                <td
                  colspan="7"
                  class="px-5 py-12 text-center"
                >
                  <p
                    class="text-sm font-medium text-slate-700"
                  >
                    找不到符合條件的候選人
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
                v-for="candidate in candidateStore.candidates"
                v-else
                :key="candidate.id"
                class="transition hover:bg-slate-50"
              >
                <!-- Name -->
                <td
                  class="whitespace-nowrap px-5 py-4"
                >
                  <div>
                    <p
                      class="font-medium text-slate-900"
                    >
                      {{ candidate.name }}
                    </p>

                    <p
                      class="mt-1 max-w-xs truncate text-xs text-slate-500"
                    >
                      {{ candidate.email }}
                    </p>
                  </div>
                </td>

                <!-- Current title -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  <p>
                    {{ candidate.currentTitle }}
                  </p>

                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    {{ candidate.currentCompany }}
                  </p>
                </td>

                <!-- Location -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  {{ candidate.location }}
                </td>

                <!-- Source -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                >
                  {{ candidate.source }}
                </td>

                <!-- Status -->
                <td
                  class="whitespace-nowrap px-5 py-4"
                >
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      getStatusClass(
                        candidate.status,
                      )
                    "
                  >
                    {{
                      getStatusLabel(
                        candidate.status,
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
                      candidate.createdAt,
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
                      @click="viewCandidate(candidate)"
                    >
                      查看
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
            !candidateStore.loading &&
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
            aria-label="候選人列表分頁"
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
