<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import JobForm from '../../components/JobForm.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useJobStore } from '../../stores/job'

import type { UpdateJobInput } from '../../types/job'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()

const jobId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(jobId.value) && jobId.value > 0,
)

async function handleSubmit(payload: UpdateJobInput) {
  const updatedJob = await jobStore.updateJob(jobId.value, payload)

  if (updatedJob) {
    router.push({ name: 'job-detail', params: { id: updatedJob.id } })
  }
}

function handleCancel() {
  router.push({ name: 'job-detail', params: { id: jobId.value } })
}

function load() {
  if (isValidId.value) {
    jobStore.fetchJobById(jobId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="編輯職缺"
      description="修改職缺資訊後儲存"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'job-detail', params: { id: jobId } }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回職缺詳細
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <section
        v-if="jobStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入職缺資料中..." />
      </section>

      <ErrorState
        v-else-if="jobStore.detailError"
        :message="jobStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !jobStore.selectedJob"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定職缺"
          description="此職缺可能已被刪除"
        >
          <RouterLink
            :to="{ name: 'jobs' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回職缺列表
          </RouterLink>
        </EmptyState>
      </section>

      <JobForm
        v-else
        :initial="jobStore.selectedJob"
        :submitting="jobStore.updateLoading"
        :submit-error="jobStore.updateError"
        submit-label="儲存變更"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
