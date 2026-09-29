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
import { useJobStore } from '../../stores/job'
import { formatDateTime, formatSalaryRange } from '../../utils/formatters'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_TONES,
  WORK_TYPE_LABELS,
} from '../../utils/labels'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const authStore = useAuthStore()

const jobId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(jobId.value) && jobId.value > 0,
)

const job = computed(() => jobStore.selectedJob)

const canUpdate = computed(() => authStore.can('job.update'))
const canDelete = computed(() => authStore.can('job.delete'))

const confirmOpen = ref(false)

async function confirmDelete() {
  const success = await jobStore.deleteJob(jobId.value)

  confirmOpen.value = false

  if (success) {
    router.push({ name: 'jobs' })
  }
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
      title="職缺詳細資料"
      :description="job?.title"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'jobs' }"
          class="rounded px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回職缺列表
        </RouterLink>

        <RouterLink
          v-if="job && canUpdate"
          :to="{ name: 'job-edit', params: { id: jobId } }"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          編輯職缺
        </RouterLink>

        <button
          v-if="job && canDelete"
          type="button"
          class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="jobStore.deleteLoading"
          @click="confirmOpen = true"
        >
          刪除職缺
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-5xl px-6 py-6">
      <ErrorState
        v-if="jobStore.deleteError"
        class="mb-5"
        :message="jobStore.deleteError"
      />

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
        v-else-if="!isValidId || !job"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定的職缺"
          description="此職缺可能已被刪除或不存在"
        >
          <RouterLink
            :to="{ name: 'jobs' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回職缺列表
          </RouterLink>
        </EmptyState>
      </section>

      <template v-else>
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="job-overview-title"
        >
          <div class="flex flex-wrap items-center gap-3">
            <h2
              id="job-overview-title"
              class="text-2xl font-bold text-slate-900"
            >
              {{ job.title }}
            </h2>

            <StatusBadge
              :label="JOB_STATUS_LABELS[job.status]"
              :tone="JOB_STATUS_TONES[job.status]"
            />
          </div>

          <p class="mt-2 text-sm text-slate-500">
            {{ job.department }} ・ {{ job.location }}
          </p>

          <div class="mt-6 border-t border-slate-200 pt-6">
            <h3 class="text-sm font-semibold text-slate-900">
              職缺描述
            </h3>

            <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
              {{ job.description }}
            </p>
          </div>
        </section>

        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="job-info-title"
        >
          <h3
            id="job-info-title"
            class="text-base font-semibold text-slate-900"
          >
            職缺資訊
          </h3>

          <dl class="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-slate-500">部門</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ job.department }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">工作地點</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ job.location }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">工作型態</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ WORK_TYPE_LABELS[job.workType] }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">薪資範圍</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ formatSalaryRange(job.salaryMin, job.salaryMax) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">經驗要求</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ job.experience }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">學歷要求</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ job.education }}
              </dd>
            </div>
          </dl>
        </section>

        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="job-skills-title"
        >
          <h3
            id="job-skills-title"
            class="text-base font-semibold text-slate-900"
          >
            必要技能
          </h3>

          <ul class="mt-4 flex flex-wrap gap-2">
            <li
              v-for="skill in job.requiredSkills"
              :key="skill"
              class="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
            >
              {{ skill }}
            </li>
          </ul>
        </section>

        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="job-meta-title"
        >
          <h3
            id="job-meta-title"
            class="text-base font-semibold text-slate-900"
          >
            系統資訊
          </h3>

          <dl class="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt class="text-xs font-medium text-slate-500">Job ID</dt>
              <dd class="mt-1 text-sm text-slate-700">{{ job.id }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">建立時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(job.createdAt) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">更新時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(job.updatedAt) }}
              </dd>
            </div>
          </dl>
        </section>
      </template>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="刪除職缺"
      :message="`確定要刪除職缺「${job?.title ?? ''}」嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="jobStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
