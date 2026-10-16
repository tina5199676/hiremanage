<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppAlert from '../../components/AppAlert.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import InterviewForm from '../../components/InterviewForm.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useInterviewStore } from '../../stores/interview'

import type { UpdateInterviewInput } from '../../types/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

const interviewId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(interviewId.value) && interviewId.value > 0,
)

async function handleSubmit(payload: UpdateInterviewInput) {
  const updated = await interviewStore.updateInterview(
    interviewId.value,
    payload,
  )

  if (updated) {
    router.push({ name: 'interview-detail', params: { id: updated.id } })
  }
}

function handleCancel() {
  router.push({ name: 'interview-detail', params: { id: interviewId.value } })
}

function load() {
  if (isValidId.value) {
    interviewStore.fetchInterviewById(interviewId.value)
  }
}

onMounted(() => {
  interviewStore.fetchOptions()
  load()
})
</script>

<template>
  <div>
    <PageHeader
      title="編輯面試"
      description="修改面試資訊後儲存"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'interview-detail', params: { id: interviewId } }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回面試詳細
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <AppAlert
        v-if="interviewStore.optionsError"
        class="mb-5"
        :message="interviewStore.optionsError"
      />

      <section
        v-if="interviewStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入面試資料中..." />
      </section>

      <ErrorState
        v-else-if="interviewStore.detailError"
        :message="interviewStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !interviewStore.selectedInterview"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定面試"
          description="此面試可能已被刪除"
        >
          <RouterLink
            :to="{ name: 'interviews' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回面試管理
          </RouterLink>
        </EmptyState>
      </section>

      <InterviewForm
        v-else
        :initial="interviewStore.selectedInterview"
        :application-options="interviewStore.applicationOptions"
        :interviewer-options="interviewStore.interviewerOptions"
        :options-loading="interviewStore.optionsLoading"
        :submitting="interviewStore.updateLoading"
        :submit-error="interviewStore.updateError"
        submit-label="儲存變更"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
