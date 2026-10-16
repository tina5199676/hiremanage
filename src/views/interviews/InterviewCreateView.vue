<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppAlert from '../../components/AppAlert.vue'
import InterviewForm from '../../components/InterviewForm.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useInterviewStore } from '../../stores/interview'

import type { CreateInterviewInput } from '../../types/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

/** 由應徵詳細頁「安排面試」進入時，透過 query 預選應徵紀錄 */
const defaultApplicationId = computed(() => {
  const value = Number(route.query.applicationId)

  return Number.isInteger(value) && value > 0 ? value : null
})

async function handleSubmit(payload: CreateInterviewInput) {
  const created = await interviewStore.createInterview(payload)

  if (created) {
    router.push({ name: 'interview-detail', params: { id: created.id } })
  }
}

function handleCancel() {
  router.push({ name: 'interviews' })
}

onMounted(() => {
  interviewStore.fetchOptions()
})
</script>

<template>
  <div>
    <PageHeader
      title="安排面試"
      description="為應徵中的候選人安排一場新的面試"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'interviews' }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回面試管理
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <AppAlert
        v-if="interviewStore.optionsError"
        class="mb-5"
        :message="interviewStore.optionsError"
      />

      <InterviewForm
        :default-application-id="defaultApplicationId"
        :application-options="interviewStore.applicationOptions"
        :interviewer-options="interviewStore.interviewerOptions"
        :options-loading="interviewStore.optionsLoading"
        :submitting="interviewStore.createLoading"
        :submit-error="interviewStore.createError"
        submit-label="建立面試"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
