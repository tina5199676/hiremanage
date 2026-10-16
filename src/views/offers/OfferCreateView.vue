<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppAlert from '../../components/AppAlert.vue'
import OfferForm from '../../components/OfferForm.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useOfferStore } from '../../stores/offer'

import type { CreateOfferInput } from '../../types/offer'

const route = useRoute()
const router = useRouter()
const offerStore = useOfferStore()

/** 由應徵詳細頁「建立 Offer」進入時，透過 query 預選應徵紀錄 */
const defaultApplicationId = computed(() => {
  const value = Number(route.query.applicationId)

  return Number.isInteger(value) && value > 0 ? value : null
})

async function handleSubmit(payload: CreateOfferInput) {
  const created = await offerStore.createOffer(payload)

  if (created) {
    router.push({ name: 'offer-detail', params: { id: created.id } })
  }
}

function handleCancel() {
  router.push({ name: 'offers' })
}

onMounted(() => {
  offerStore.fetchApplicationOptions()
})
</script>

<template>
  <div>
    <PageHeader
      title="建立 Offer"
      description="為通過面試的候選人建立錄取通知"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'offers' }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回 Offer 管理
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <AppAlert
        v-if="offerStore.optionsError"
        class="mb-5"
        :message="offerStore.optionsError"
      />

      <OfferForm
        :default-application-id="defaultApplicationId"
        :application-options="offerStore.applicationOptions"
        :options-loading="offerStore.optionsLoading"
        :submitting="offerStore.createLoading"
        :submit-error="offerStore.createError"
        submit-label="建立 Offer"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
