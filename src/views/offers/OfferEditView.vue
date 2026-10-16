<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import OfferForm from '../../components/OfferForm.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useOfferStore } from '../../stores/offer'

import type { CreateOfferInput } from '../../types/offer'

const route = useRoute()
const router = useRouter()
const offerStore = useOfferStore()

const offerId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(offerId.value) && offerId.value > 0,
)

const offer = computed(() => offerStore.selectedOffer)

/** 已接受的 Offer 不可修改，與 Mock API 規則一致 */
const editable = computed(() => offer.value?.status !== 'accepted')

async function handleSubmit(payload: CreateOfferInput) {
  const { applicationId: _applicationId, ...updatePayload } = payload

  const updated = await offerStore.updateOffer(offerId.value, updatePayload)

  if (updated) {
    router.push({ name: 'offer-detail', params: { id: updated.id } })
  }
}

function handleCancel() {
  router.push({ name: 'offer-detail', params: { id: offerId.value } })
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
      title="編輯 Offer"
      description="修改 Offer 內容後儲存"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'offer-detail', params: { id: offerId } }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回 Offer 詳細
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
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
          title="找不到指定 Offer"
          description="此 Offer 可能已被刪除"
        >
          <RouterLink
            :to="{ name: 'offers' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回 Offer 管理
          </RouterLink>
        </EmptyState>
      </section>

      <section
        v-else-if="!editable"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="已接受的 Offer 不可修改"
          description="候選人已接受此 Offer，內容已鎖定"
        >
          <RouterLink
            :to="{ name: 'offer-detail', params: { id: offerId } }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回 Offer 詳細
          </RouterLink>
        </EmptyState>
      </section>

      <OfferForm
        v-else
        :initial="offer"
        :submitting="offerStore.updateLoading"
        :submit-error="offerStore.updateError"
        submit-label="儲存變更"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
