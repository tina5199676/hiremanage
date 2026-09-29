<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useJobStore } from '../../stores/job'

import type {
  JobStatus,
  WorkType,
} from '../../types/job'

const route = useRoute()
const router = useRouter()

const jobStore = useJobStore()

// --------------------------------------------------
// Route parameter
// --------------------------------------------------

const jobId = computed(() => {
  return Number(route.params.id)
})

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getStatusLabel(
  status: JobStatus,
) {
  switch (status) {
    case 'open':
      return '開放中'

    case 'draft':
      return '草稿'

    case 'closed':
      return '已關閉'

    default:
      return status
  }
}

function getStatusClass(
  status: JobStatus,
) {
  switch (status) {
    case 'open':
      return 'bg-emerald-50 text-emerald-700'

    case 'draft':
      return 'bg-amber-50 text-amber-700'

    case 'closed':
      return 'bg-slate-100 text-slate-600'

    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getWorkTypeLabel(
  workType: WorkType,
) {
  switch (workType) {
    case 'onsite':
      return 'On-site'

    case 'remote':
      return 'Remote'

    case 'hybrid':
      return 'Hybrid'

    default:
      return workType
  }
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value))
}

function formatSalary(
  min: number,
  max: number,
) {
  const formatter =
    new Intl.NumberFormat('zh-TW')

  return `$${formatter.format(min)} - $${formatter.format(max)}`
}

function goBack() {
  router.push('/admin/jobs')
}

function goToEditJob() {
  router.push(
    `/admin/jobs/${jobId.value}/edit`,
  )
}

async function handleDelete() {
  const confirmed = window.confirm(
    '確定要刪除這筆職缺嗎？此動作無法復原。',
  )

  if (!confirmed) {
    return
  }

  const success =
    await jobStore.deleteJob(
      jobId.value,
    )

  if (success) {
    router.push('/admin/jobs')
  }
}

// --------------------------------------------------
// Fetch
// --------------------------------------------------

onMounted(() => {
  if (
    Number.isNaN(jobId.value) ||
    jobId.value <= 0
  ) {
    return
  }

  jobStore.fetchJobById(
    jobId.value,
  )
})
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header
      class="border-b border-slate-200 bg-white"
    >
      <div
        class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"
      >
        <div>
          <button
            type="button"
            class="mb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            @click="goBack"
          >
            ← 返回職缺列表
          </button>

          <h1
            class="text-2xl font-bold text-slate-900"
          >
            職缺詳細資料
          </h1>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="goToEditJob"
          >
            編輯職缺
          </button>

          <button
            type="button"
            class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="jobStore.deleteLoading"
            @click="handleDelete"
          >
            {{
              jobStore.deleteLoading
                ? '刪除中...'
                : '刪除職缺'
            }}
          </button>
        </div>
      </div>
    </header>

    <div
      class="mx-auto max-w-5xl px-6 py-6"
    >
      <!-- Delete error -->
      <div
        v-if="jobStore.deleteError"
        class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ jobStore.deleteError }}
      </div>

      <!-- Loading -->
      <section
        v-if="jobStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <p
          class="text-sm text-slate-500"
        >
          載入職缺資料中...
        </p>
      </section>

      <!-- Error -->
      <section
        v-else-if="jobStore.detailError"
        class="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <p
          class="text-sm font-medium text-red-700"
        >
          {{ jobStore.detailError }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          @click="goBack"
        >
          返回職缺列表
        </button>
      </section>

      <!-- Not found -->
      <section
        v-else-if="
          !jobStore.selectedJob
        "
        class="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <p
          class="text-sm font-medium text-slate-700"
        >
          找不到指定的職缺
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          @click="goBack"
        >
          返回職缺列表
        </button>
      </section>

      <!-- Detail -->
      <template
        v-else
      >
        <!-- Main information -->
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div
                class="flex flex-wrap items-center gap-3"
              >
                <h2
                  class="text-2xl font-bold text-slate-900"
                >
                  {{
                    jobStore
                      .selectedJob
                      .title
                  }}
                </h2>

                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    getStatusClass(
                      jobStore
                        .selectedJob
                        .status,
                    )
                  "
                >
                  {{
                    getStatusLabel(
                      jobStore
                        .selectedJob
                        .status,
                    )
                  }}
                </span>
              </div>

              <p
                class="mt-2 text-sm text-slate-500"
              >
                {{
                  jobStore
                    .selectedJob
                    .department
                }}
                ・
                {{
                  jobStore
                    .selectedJob
                    .location
                }}
              </p>
            </div>
          </div>

          <div
            class="mt-6 border-t border-slate-200 pt-6"
          >
            <h3
              class="text-sm font-semibold text-slate-900"
            >
              職缺描述
            </h3>

            <p
              class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600"
            >
              {{
                jobStore
                  .selectedJob
                  .description
              }}
            </p>
          </div>
        </section>

        <!-- Job information -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3
            class="text-base font-semibold text-slate-900"
          >
            職缺資訊
          </h3>

          <dl
            class="mt-5 grid gap-6 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                部門
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  jobStore
                    .selectedJob
                    .department
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                工作地點
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  jobStore
                    .selectedJob
                    .location
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                工作型態
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  getWorkTypeLabel(
                    jobStore
                      .selectedJob
                      .workType,
                  )
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                薪資範圍
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  formatSalary(
                    jobStore
                      .selectedJob
                      .salaryMin,
                    jobStore
                      .selectedJob
                      .salaryMax,
                  )
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                經驗要求
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  jobStore
                    .selectedJob
                    .experience
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                學歷要求
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  jobStore
                    .selectedJob
                    .education
                }}
              </dd>
            </div>
          </dl>
        </section>

        <!-- Skills -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3
            class="text-base font-semibold text-slate-900"
          >
            必要技能
          </h3>

          <div
            class="mt-4 flex flex-wrap gap-2"
          >
            <span
              v-for="skill in jobStore.selectedJob.requiredSkills"
              :key="skill"
              class="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
            >
              {{ skill }}
            </span>
          </div>
        </section>

        <!-- Metadata -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3
            class="text-base font-semibold text-slate-900"
          >
            系統資訊
          </h3>

          <dl
            class="mt-5 grid gap-6 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                Job ID
              </dt>

              <dd
                class="mt-1 text-sm text-slate-700"
              >
                {{
                  jobStore
                    .selectedJob
                    .id
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                建立時間
              </dt>

              <dd
                class="mt-1 text-sm text-slate-700"
              >
                {{
                  formatDate(
                    jobStore
                      .selectedJob
                      .createdAt,
                  )
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                更新時間
              </dt>

              <dd
                class="mt-1 text-sm text-slate-700"
              >
                {{
                  formatDate(
                    jobStore
                      .selectedJob
                      .updatedAt,
                  )
                }}
              </dd>
            </div>
          </dl>
        </section>
      </template>
    </div>
  </main>
</template>