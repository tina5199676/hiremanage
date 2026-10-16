<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppPagination from '../../components/AppPagination.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import SortButton from '../../components/SortButton.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useOfferStore } from '../../stores/offer'
import { formatCurrency, formatDate } from '../../utils/formatters'
import {
  OFFER_STATUS_LABELS,
  OFFER_STATUS_TONES,
  toOptions,
} from '../../utils/labels'

import type { SortOrder } from '../../types/common'
import type { Offer, OfferSortBy, OfferStatus } from '../../types/offer'

const offerStore = useOfferStore()
const authStore = useAuthStore()

const canCreate = computed(() => authStore.can('offer.create'))
const canDelete = computed(() => authStore.can('offer.delete'))

// --------------------------------------------------
// Options
// --------------------------------------------------

const statusOptions = toOptions(OFFER_STATUS_LABELS, '全部狀態')
const pageSizeOptions = [5, 10, 20]

// --------------------------------------------------
// Search / filter
// --------------------------------------------------

const searchInput = ref('')

function applyFilters() {
  offerStore.setQuery({
    search: searchInput.value.trim() || undefined,
    page: 1,
  })

  offerStore.fetchOffers()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  offerStore.setQuery({
    status: value ? (value as OfferStatus) : undefined,
    page: 1,
  })

  offerStore.fetchOffers()
}

function handlePageSizeChange(event: Event) {
  offerStore.setQuery({
    pageSize: Number((event.target as HTMLSelectElement).value),
    page: 1,
  })

  offerStore.fetchOffers()
}

function clearFilters() {
  searchInput.value = ''
  offerStore.resetQuery()
  offerStore.fetchOffers()
}

// --------------------------------------------------
// Sort
// --------------------------------------------------

const currentSortBy = computed<OfferSortBy>(
  () => offerStore.query.sortBy ?? 'createdAt',
)

const currentSortOrder = computed<SortOrder>(
  () => offerStore.query.sortOrder ?? 'desc',
)

function toggleSort(sortBy: OfferSortBy) {
  let nextSortOrder: SortOrder = 'asc'

  if (currentSortBy.value === sortBy) {
    nextSortOrder = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  offerStore.setQuery({ sortBy, sortOrder: nextSortOrder, page: 1 })
  offerStore.fetchOffers()
}

function ariaSort(sortBy: OfferSortBy) {
  if (currentSortBy.value !== sortBy) {
    return 'none'
  }

  return currentSortOrder.value === 'asc' ? 'ascending' : 'descending'
}

// --------------------------------------------------
// Pagination
// --------------------------------------------------

function goToPage(page: number) {
  offerStore.setQuery({ page })
  offerStore.fetchOffers()
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const offerToDelete = ref<Offer | null>(null)

async function confirmDelete() {
  if (!offerToDelete.value) {
    return
  }

  const success = await offerStore.deleteOffer(offerToDelete.value.id)

  offerToDelete.value = null

  if (success) {
    // 若目前頁面被刪空，退回上一頁
    if (offerStore.offers.length === 1 && (offerStore.query.page ?? 1) > 1) {
      offerStore.setQuery({ page: (offerStore.query.page ?? 1) - 1 })
    }

    offerStore.fetchOffers()
  }
}

onMounted(() => {
  searchInput.value = offerStore.query.search ?? ''
  offerStore.fetchOffers()
})
</script>

<template>
  <div>
    <PageHeader
      title="Offer 管理"
      description="管理發給候選人的錄取通知與回覆狀態"
    >
      <template #actions>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'offer-create' }"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          ＋ 建立 Offer
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-6 py-6">
      <!-- Filters -->
      <section
        aria-labelledby="offer-filter-title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="offer-filter-title"
          class="sr-only"
        >
          搜尋與篩選
        </h2>

        <div class="grid gap-4 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <label
              for="offer-search"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              搜尋 Offer
            </label>

            <div class="flex gap-2">
              <input
                id="offer-search"
                v-model="searchInput"
                type="search"
                placeholder="搜尋候選人或職缺名稱..."
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
              for="offer-status"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              狀態
            </label>

            <select
              id="offer-status"
              :value="offerStore.query.status ?? ''"
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
              for="offer-page-size"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              每頁筆數
            </label>

            <select
              id="offer-page-size"
              :value="offerStore.pagination.pageSize"
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

          <div class="flex items-end lg:col-span-4">
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
            {{ offerStore.pagination.total }}
          </span>
          筆 Offer
        </p>

        <p
          v-if="offerStore.pagination.totalPages > 0"
          class="text-sm text-slate-500"
        >
          第 {{ offerStore.pagination.page }} / {{ offerStore.pagination.totalPages }} 頁
        </p>
      </div>

      <ErrorState
        v-if="offerStore.error"
        class="mt-4"
        :message="offerStore.error"
        show-retry
        @retry="offerStore.fetchOffers()"
      />

      <ErrorState
        v-if="offerStore.deleteError"
        class="mt-4"
        :message="offerStore.deleteError"
      />

      <!-- Table -->
      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <caption class="sr-only">
              Offer 列表
            </caption>

            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  候選人 / 職缺
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="ariaSort('salary')"
                >
                  <SortButton
                    label="月薪"
                    :active="currentSortBy === 'salary'"
                    :order="currentSortOrder"
                    @toggle="toggleSort('salary')"
                  />
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="ariaSort('startDate')"
                >
                  <SortButton
                    label="到職日期"
                    :active="currentSortBy === 'startDate'"
                    :order="currentSortOrder"
                    @toggle="toggleSort('startDate')"
                  />
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  :aria-sort="ariaSort('expirationDate')"
                >
                  <SortButton
                    label="有效期限"
                    :active="currentSortBy === 'expirationDate'"
                    :order="currentSortOrder"
                    @toggle="toggleSort('expirationDate')"
                  />
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
              <tr v-if="offerStore.loading">
                <td colspan="7">
                  <LoadingState />
                </td>
              </tr>

              <tr v-else-if="offerStore.offers.length === 0">
                <td colspan="7">
                  <EmptyState
                    title="找不到符合條件的 Offer"
                    description="請調整搜尋條件或篩選條件"
                  />
                </td>
              </tr>

              <tr
                v-for="offer in offerStore.offers"
                v-else
                :key="offer.id"
                class="transition hover:bg-slate-50"
              >
                <td class="px-5 py-4">
                  <RouterLink
                    :to="{ name: 'offer-detail', params: { id: offer.id } }"
                    class="rounded font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ offer.candidateName }}
                  </RouterLink>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ offer.jobTitle }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ formatCurrency(offer.salary) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ offer.startDate }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ offer.expirationDate }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    :label="OFFER_STATUS_LABELS[offer.status]"
                    :tone="OFFER_STATUS_TONES[offer.status]"
                  />
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatDate(offer.createdAt) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <RouterLink
                      :to="{ name: 'offer-detail', params: { id: offer.id } }"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      查看
                      <span class="sr-only">{{ offer.candidateName }} 的 Offer</span>
                    </RouterLink>

                    <button
                      v-if="canDelete && offer.status !== 'accepted'"
                      type="button"
                      class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="offerStore.deleteLoading"
                      @click="offerToDelete = offer"
                    >
                      刪除
                      <span class="sr-only">{{ offer.candidateName }} 的 Offer</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          v-if="!offerStore.loading && offerStore.pagination.totalPages > 0"
          :page="offerStore.pagination.page"
          :page-size="offerStore.pagination.pageSize"
          :total="offerStore.pagination.total"
          :total-pages="offerStore.pagination.totalPages"
          aria-label="Offer 列表分頁"
          @update:page="goToPage"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="offerToDelete !== null"
      title="刪除 Offer"
      :message="`確定要刪除「${offerToDelete?.candidateName ?? ''}」的 Offer 嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="offerStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="offerToDelete = null"
    />
  </div>
</template>
