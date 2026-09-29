<script setup lang="ts">
import { useRouter } from 'vue-router'

import CandidateForm from '../../components/CandidateForm.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useCandidateStore } from '../../stores/candidate'

import type { CreateCandidateInput } from '../../types/candidate'

const router = useRouter()
const candidateStore = useCandidateStore()

async function handleSubmit(payload: CreateCandidateInput) {
  const created = await candidateStore.createCandidate(payload)

  if (created) {
    router.push({ name: 'candidate-detail', params: { id: created.id } })
  }
}

function handleCancel() {
  router.push({ name: 'candidates' })
}
</script>

<template>
  <div>
    <PageHeader
      title="新增候選人"
      description="填寫候選人的基本資料"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'candidates' }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回候選人列表
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <CandidateForm
        :submitting="candidateStore.createLoading"
        :submit-error="candidateStore.createError"
        submit-label="新增候選人"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
