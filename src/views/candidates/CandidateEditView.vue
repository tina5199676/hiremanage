<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CandidateForm from '../../components/CandidateForm.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useCandidateStore } from '../../stores/candidate'

import type { UpdateCandidateInput } from '../../types/candidate'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()

const candidateId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(candidateId.value) && candidateId.value > 0,
)

async function handleSubmit(payload: UpdateCandidateInput) {
  const updated = await candidateStore.updateCandidate(
    candidateId.value,
    payload,
  )

  if (updated) {
    router.push({ name: 'candidate-detail', params: { id: updated.id } })
  }
}

function handleCancel() {
  router.push({ name: 'candidate-detail', params: { id: candidateId.value } })
}

function load() {
  if (isValidId.value) {
    candidateStore.fetchCandidateById(candidateId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="編輯候選人"
      description="修改候選人資料後儲存"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'candidate-detail', params: { id: candidateId } }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回候選人詳細
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <section
        v-if="candidateStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入候選人資料中..." />
      </section>

      <ErrorState
        v-else-if="candidateStore.detailError"
        :message="candidateStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !candidateStore.selectedCandidate"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定候選人"
          description="此候選人可能已被刪除"
        >
          <RouterLink
            :to="{ name: 'candidates' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回候選人列表
          </RouterLink>
        </EmptyState>
      </section>

      <CandidateForm
        v-else
        :initial="candidateStore.selectedCandidate"
        :submitting="candidateStore.updateLoading"
        :submit-error="candidateStore.updateError"
        submit-label="儲存變更"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
