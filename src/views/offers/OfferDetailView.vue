<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useOfferStore } from '../../stores/offer'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { OFFER_STATUS_LABELS, OFFER_STATUS_TONES } from '../../utils/labels'

import type { OfferStatus } from '../../types/offer'

const route = useRoute()
const router = useRouter()
const offerStore = useOfferStore()
const authStore = useAuthStore()

const offerId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(offerId.value) && offerId.value > 0,
)

const offer = computed(() => offerStore.selectedOffer)

const canUpdate = computed(() => authStore.can('offer.update'))
const canDelete = computed(() => authStore.can('offer.delete'))

/** 與 Mock API 的狀態流轉規則一致：draft → sent → accepted / rejected */
const NEXT_STATUSES: Record<OfferStatus, OfferStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
}

const STATUS_ACTION_LABELS: Record<OfferStatus, string> = {
  draft: '退回草稿',
  sent: '送出 Offer',
  accepted: '標記為已接受',
  rejected: '標記為已拒絕',
}

const nextStatuses = computed(() =>
  offer.value ? NEXT_STATUSES[offer.value.status] : [],
)

const editable = computed(() => offer.value?.status !== 'accepted')

// --------------------------------------------------
// Status change
// --------------------------------------------------

const pendingStatus = ref<OfferStatus | null>(null)

const statusSaved = ref(false)

async function confirmStatusChange() {
  if (!pendingStatus.value) {
    return
  }

  statusSaved.value = false

  const updated = await offerStore.updateStatus(
    offerId.value,
    pendingStatus.value,
  )

  pendingStatus.value = null

  statusSaved.value = updated !== null
}

const statusDialogMessage = computed(() => {
  if (!offer.value || !pendingStatus.value) {
    return ''
  }

  const base = `確定要將「${offer.value.candidateName}」的 Offer 狀態改為「${OFFER_STATUS_LABELS[pendingStatus.value]}」嗎？`

  if (pendingStatus.value === 'accepted') {
    return `${base} 候選人的應徵狀態將同步更新為 Hired，且此 Offer 之後不可再修改。`
  }

  return base
})

// --------------------------------------------------
// Delete
// --------------------------------------------------

const confirmDeleteOpen = ref(false)

async function confirmDelete() {
  const success = await offerStore.deleteOffer(offerId.value)

  confirmDeleteOpen.value = false

  if (success) {
    router.push({ name: 'offers' })
  }
}

function load() {
  if (isValidId.value) {
    offerStore.fetchOfferById(offerId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="Offer 詳細資料"
      :description="offer ? `${offer.candidateName} - ${offer.jobTitle}` : undefined"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'offers' }"
          class="rounded px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回 Offer 管理
        </RouterLink>

        <RouterLink
          v-if="offer && canUpdate && editable"
          :to="{ name: 'offer-edit', params: { id: offerId } }"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          編輯 Offer
        </RouterLink>

        <button
          v-if="offer && canDelete && editable"
          type="button"
          class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="offerStore.deleteLoading"
          @click="confirmDeleteOpen = true"
        >
          刪除 Offer
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-4xl px-6 py-6">
      <ErrorState
        v-if="offerStore.deleteError"
        class="mb-5"
        :message="offerStore.deleteError"
      />

      <ErrorState
        v-if="offerStore.updateError"
        class="mb-5"
        :message="offerStore.updateError"
      />

      <section
        v-if="offerStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入 Offer 資料中..." />
      </section>

      <ErrorState
        v-else-if="offerStore.detailError"
        :message="offerStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !offer"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定的 Offer"
          description="此 Offer 可能已被刪除或不存在"
        >
          <RouterLink
            :to="{ name: 'offers' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回 Offer 管理
          </RouterLink>
        </EmptyState>
      </section>

      <template v-else>
        <!-- Overview -->
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="offer-overview-title"
        >
          <div class="flex flex-wrap items-center gap-3">
            <h2
              id="offer-overview-title"
              class="text-2xl font-bold text-slate-900"
            >
              {{ offer.candidateName }}
            </h2>

            <StatusBadge
              :label="OFFER_STATUS_LABELS[offer.status]"
              :tone="OFFER_STATUS_TONES[offer.status]"
            />
          </div>

          <p class="mt-2 text-sm text-slate-500">
            {{ offer.jobTitle }}
          </p>

          <dl class="mt-6 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-slate-500">候選人</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'candidate-detail', params: { id: offer.candidateId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ offer.candidateName }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">職缺</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'job-detail', params: { id: offer.jobId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ offer.jobTitle }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">應徵紀錄</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'application-detail', params: { id: offer.applicationId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  查看應徵紀錄 #{{ offer.applicationId }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">月薪</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ formatCurrency(offer.salary) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">到職日期</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ offer.startDate }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">Offer 有效期限</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ offer.expirationDate }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 border-t border-slate-200 pt-6">
            <h3 class="text-sm font-semibold text-slate-900">
              福利
            </h3>

            <ul
              v-if="offer.benefits.length > 0"
              class="mt-3 flex flex-wrap gap-2"
            >
              <li
                v-for="benefit in offer.benefits"
                :key="benefit"
                class="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
              >
                {{ benefit }}
              </li>
            </ul>

            <p
              v-else
              class="mt-2 text-sm text-slate-500"
            >
              未列出福利
            </p>
          </div>

          <div class="mt-6 border-t border-slate-200 pt-6">
            <h3 class="text-sm font-semibold text-slate-900">
              Offer 說明
            </h3>

            <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
              {{ offer.message }}
            </p>
          </div>
        </section>

        <!-- Status actions -->
        <section
          v-if="canUpdate"
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="offer-status-title"
        >
          <h3
            id="offer-status-title"
            class="text-base font-semibold text-slate-900"
          >
            狀態流轉
          </h3>

          <p class="mt-1 text-sm text-slate-500">
            草稿 → 已送出 → 已接受 / 已拒絕
          </p>

          <p
            v-if="statusSaved"
            role="status"
            class="mt-3 text-sm text-emerald-700"
          >
            狀態已更新
          </p>

          <div
            v-if="nextStatuses.length > 0"
            class="mt-4 flex flex-wrap gap-2"
          >
            <button
              v-for="status in nextStatuses"
              :key="status"
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              :class="
                status === 'rejected'
                  ? 'border border-red-300 text-red-600 hover:bg-red-50 focus:ring-red-500'
                  : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500'
              "
              :disabled="offerStore.statusUpdating"
              @click="pendingStatus = status"
            >
              {{ STATUS_ACTION_LABELS[status] }}
            </button>
          </div>

          <p
            v-else
            class="mt-4 text-sm text-slate-500"
          >
            此 Offer 已{{ OFFER_STATUS_LABELS[offer.status] }}，流程已結束
          </p>
        </section>

        <!-- Meta -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="offer-meta-title"
        >
          <h3
            id="offer-meta-title"
            class="text-base font-semibold text-slate-900"
          >
            系統資訊
          </h3>

          <dl class="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt class="text-xs font-medium text-slate-500">Offer ID</dt>
              <dd class="mt-1 text-sm text-slate-700">{{ offer.id }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">建立時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(offer.createdAt) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">更新時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(offer.updatedAt) }}
              </dd>
            </div>
          </dl>
        </section>
      </template>
    </div>

    <ConfirmDialog
      :open="pendingStatus !== null"
      title="變更 Offer 狀態"
      :message="statusDialogMessage"
      confirm-label="確認變更"
      :tone="pendingStatus === 'rejected' ? 'danger' : 'primary'"
      :loading="offerStore.statusUpdating"
      @confirm="confirmStatusChange"
      @cancel="pendingStatus = null"
    />

    <ConfirmDialog
      :open="confirmDeleteOpen"
      title="刪除 Offer"
      :message="`確定要刪除「${offer?.candidateName ?? ''}」的 Offer 嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="offerStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmDeleteOpen = false"
    />
  </div>
</template>
