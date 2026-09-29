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
import { useCandidateStore } from '../../stores/candidate'
import { formatDate } from '../../utils/formatters'
import {
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_TONES,
  toOptions,
} from '../../utils/labels'

import type {
  Candidate,
  CandidateSortBy,
  CandidateSource,
  CandidateStatus,
  SortOrder,
} from '../../types/candidate'

const router = useRouter()
const candidateStore = useCandidateStore()
const authStore = useAuthStore()

const canCreate = computed(() => authStore.can('candidate.create'))
const canUpdate = computed(() => authStore.can('candidate.update'))
const canDelete = computed(() => authStore.can('candidate.delete'))

const statusOptions = toOptions(CANDIDATE_STATUS_LABELS, '全部狀態')
const sourceOptions = toOptions(CANDIDATE_SOURCE_LABELS, '全部來源')
const pageSizeOptions = [5, 10, 20]

// --------------------------------------------------
// Search / filter
// --------------------------------------------------

const searchInput = ref('')

function applyFilters() {
  candidateStore.setQuery({
    search: searchInput.value.trim() || undefined,
    page: 1,
  })

  candidateStore.fetchCandidates()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  candidateStore.setQuery({
    status: value ? (value as CandidateStatus) : undefined,
    page: 1,
  })

  candidateStore.fetchCandidates()
}

function handleSourceChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  candidateStore.setQuery({
    source: value ? (value as CandidateSource) : undefined,
    page: 1,
  })

  candidateStore.fetchCandidates()
}

function handlePageSizeChange(event: Event) {
  candidateStore.setQuery({
    pageSize: Number((event.target as HTMLSelectElement).value),
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

const currentSortBy = computed<CandidateSortBy>(
  () => candidateStore.query.sortBy ?? 'createdAt',
)

const currentSortOrder = computed<SortOrder>(
  () => candidateStore.query.sortOrder ?? 'desc',
)

function toggleSort(sortBy: CandidateSortBy) {
  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy.value === sortBy) {
    nextSortOrder = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  candidateStore.setQuery({ sortBy, sortOrder: nextSortOrder, page: 1 })
  candidateStore.fetchCandidates()
}

function ariaSort(key: CandidateSortBy) {
  if (currentSortBy.value !== key) {
    return 'none'
  }

  return currentSortOrder.value === 'asc' ? 'ascending' : 'descending'
}

// --------------------------------------------------
// Pagination
// --------------------------------------------------

function goToPage(page: number) {
  candidateStore.setQuery({ page })
  candidateStore.fetchCandidates()
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const candidateToDelete = ref<Candidate | null>(null)

async function confirmDelete() {
  if (!candidateToDelete.value) {
    return
  }

  const success = await candidateStore.deleteCandidate(
    candidateToDelete.value.id,
  )

  candidateToDelete.value = null

  if (success) {
    if (
      candidateStore.candidates.length === 1 &&
      (candidateStore.query.page ?? 1) > 1
    ) {
      candidateStore.setQuery({ page: (candidateStore.query.page ?? 1) - 1 })
    }

    candidateStore.fetchCandidates()
  }
}

// --------------------------------------------------
// Navigation
// --------------------------------------------------

function viewCandidate(candidate: Candidate) {
  router.push({ name: 'candidate-detail', params: { id: candidate.id } })
}

function editCandidate(candidate: Candidate) {
  router.push({ name: 'candidate-edit', params: { id: candidate.id } })
}

onMounted(() => {
  searchInput.value = candidateStore.query.search ?? ''
  candidateStore.fetchCandidates()
})
</script>

<template>
  <div>
    <PageHeader
      title="候選人"
      description="管理所有候選人的基本資料與狀態"
    >
      <template #actions>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'candidate-create' }"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          ＋ 新增候選人
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-6 py-6">
      <section
        aria-labelledby="candidate-filter-title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="candidate-filter-title"
          class="sr-only"
        >
          搜尋與篩選
        </h2>

        <div class="grid gap-4 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <label
              for="candidate-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋候選人
            </label>

            <div class="flex gap-2">
              <input
                id="candidate-search"
                v-model="searchInput"
                type="search"
                placeholder="搜尋姓名、Email 或技能..."
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
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

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
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="candidate-page-size"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              每頁筆數
            </label>

            <select
              id="candidate-page-size"
              :value="candidateStore.pagination.pageSize"
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

      <div
        class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          class="text-sm text-slate-600"
          aria-live="polite"
        >
          共
          <span class="font-semibold text-slate-900">
            {{ candidateStore.pagination.total }}
          </span>
          位候選人
        </p>

        <p
          v-if="candidateStore.pagination.totalPages > 0"
          class="text-sm text-slate-500"
        >
          第 {{ candidateStore.pagination.page }} /
          {{ candidateStore.pagination.totalPages }} 頁
        </p>
      </div>

      <ErrorState
        v-if="candidateStore.error"
        class="mt-4"
        :message="candidateStore.error"
        show-retry
        @retry="candidateStore.fetchCandidates()"
      />

      <ErrorState
        v-if="candidateStore.deleteError"
        class="mt-4"
        :message="candidateStore.deleteError"
      />

      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <caption class="sr-only">
              候選人列表
            </caption>

            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="ariaSort('name')"
                >
                  <SortButton
                    label="姓名"
                    :active="currentSortBy === 'name'"
                    :order="currentSortOrder"
                    @toggle="toggleSort('name')"
                  />
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  目前職務
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
                  來源
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
                  :aria-sort="ariaSort('createdAt')"
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
                  class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  操作
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="candidateStore.loading">
                <td colspan="7">
                  <LoadingState />
                </td>
              </tr>

              <tr v-else-if="candidateStore.candidates.length === 0">
                <td colspan="7">
                  <EmptyState
                    title="找不到符合條件的候選人"
                    description="請調整搜尋條件或篩選條件"
                  />
                </td>
              </tr>

              <tr
                v-for="candidate in candidateStore.candidates"
                v-else
                :key="candidate.id"
                class="transition hover:bg-slate-50"
              >
                <td class="px-5 py-4">
                  <RouterLink
                    :to="{ name: 'candidate-detail', params: { id: candidate.id } }"
                    class="rounded font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ candidate.name }}
                  </RouterLink>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ candidate.email }}
                  </p>
                </td>

                <td class="px-5 py-4 text-sm text-slate-700">
                  <p>{{ candidate.currentTitle }}</p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ candidate.currentCompany }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ candidate.location }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ CANDIDATE_SOURCE_LABELS[candidate.source] }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    :label="CANDIDATE_STATUS_LABELS[candidate.status]"
                    :tone="CANDIDATE_STATUS_TONES[candidate.status]"
                  />
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatDate(candidate.createdAt) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      @click="viewCandidate(candidate)"
                    >
                      查看
                      <span class="sr-only">{{ candidate.name }}</span>
                    </button>

                    <button
                      v-if="canUpdate"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @click="editCandidate(candidate)"
                    >
                      編輯
                      <span class="sr-only">{{ candidate.name }}</span>
                    </button>

                    <button
                      v-if="canDelete"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="candidateStore.deleteLoading"
                      @click="candidateToDelete = candidate"
                    >
                      刪除
                      <span class="sr-only">{{ candidate.name }}</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          v-if="!candidateStore.loading && candidateStore.pagination.totalPages > 0"
          :page="candidateStore.pagination.page"
          :page-size="candidateStore.pagination.pageSize"
          :total="candidateStore.pagination.total"
          :total-pages="candidateStore.pagination.totalPages"
          aria-label="候選人列表分頁"
          @update:page="goToPage"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="candidateToDelete !== null"
      title="刪除候選人"
      :message="`確定要刪除候選人「${candidateToDelete?.name ?? ''}」嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="candidateStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="candidateToDelete = null"
    />
  </div>
</template>
