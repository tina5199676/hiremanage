<script setup lang="ts">
import { useRouter } from 'vue-router'

import JobForm from '../../components/JobForm.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useJobStore } from '../../stores/job'

import type { CreateJobInput } from '../../types/job'

const router = useRouter()
const jobStore = useJobStore()

async function handleSubmit(payload: CreateJobInput) {
  const createdJob = await jobStore.createJob(payload)

  if (createdJob) {
    router.push({ name: 'job-detail', params: { id: createdJob.id } })
  }
}

function handleCancel() {
  router.push({ name: 'jobs' })
}
</script>

<template>
  <div>
    <PageHeader
      title="建立職缺"
      description="填寫以下資訊以建立新的職缺"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'jobs' }"
          class="text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          ← 返回職缺列表
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <JobForm
        :submitting="jobStore.createLoading"
        :submit-error="jobStore.createError"
        submit-label="建立職缺"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
