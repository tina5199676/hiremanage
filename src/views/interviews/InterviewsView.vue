<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import InterviewCalendar from '../../components/InterviewCalendar.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useInterviewStore } from '../../stores/interview'
import {
  formatMonthTitle,
  getMonthRange,
  shiftMonth,
  toDateKey,
} from '../../utils/dates'
import {
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STAGE_LABELS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUS_TONES,
  toOptions,
} from '../../utils/labels'

import type { Interview, InterviewStatus } from '../../types/interview'

const router = useRouter()
const interviewStore = useInterviewStore()
const authStore = useAuthStore()

const canCreate = computed(() => authStore.can('interview.create'))

// --------------------------------------------------
// Month navigation
// --------------------------------------------------

const today = new Date()

const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)

const monthTitle = computed(() => formatMonthTitle(year.value, month.value))

function loadMonth() {
  const range = getMonthRange(year.value, month.value)

  interviewStore.setQuery({ from: range.from, to: range.to, page: 1 })
  interviewStore.fetchInterviews()
}

function goToMonth(delta: number) {
  const next = shiftMonth(year.value, month.value, delta)

  year.value = next.year
  month.value = next.month

  loadMonth()
}

function goToToday() {
  year.value = today.getFullYear()
  month.value = today.getMonth() + 1

  loadMonth()
}

// --------------------------------------------------
// Filter
// --------------------------------------------------

const statusOptions = toOptions(INTERVIEW_STATUS_LABELS, '全部狀態')

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  interviewStore.setQuery({
    status: value ? (value as InterviewStatus) : undefined,
    page: 1,
  })

  interviewStore.fetchInterviews()
}

// --------------------------------------------------
// Display mode
// --------------------------------------------------

type ViewMode = 'calendar' | 'list'

const viewMode = ref<ViewMode>('calendar')

const todayKey = toDateKey(today)

const upcomingCount = computed(
  () =>
    interviewStore.interviews.filter(
      (interview) =>
        interview.status === 'scheduled' && interview.date >= todayKey,
    ).length,
)

function openInterview(interview: Interview) {
  router.push({ name: 'interview-detail', params: { id: interview.id } })
}

onMounted(loadMonth)
</script>

<template>
  <div>
    <PageHeader
      title="面試管理"
      description="以行事曆檢視與安排候選人的面試"
    >
      <template #actions>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'interview-create' }"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          ＋ 安排面試
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-6 py-6">
      <!-- Toolbar -->
      <section
        aria-labelledby="interview-toolbar-title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="interview-toolbar-title"
          class="sr-only"
        >
          月份與篩選
        </h2>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              aria-label="上個月"
              @click="goToMonth(-1)"
            >
              ←
            </button>

            <h3
              class="min-w-32 text-center text-lg font-semibold text-slate-900"
              aria-live="polite"
            >
              {{ monthTitle }}
            </h3>

            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              aria-label="下個月"
              @click="goToMonth(1)"
            >
              →
            </button>

            <button
              type="button"
              class="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              @click="goToToday"
            >
              今天
            </button>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div>
              <label
                for="interview-status"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                狀態
              </label>

              <select
                id="interview-status"
                :value="interviewStore.query.status ?? ''"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-40"
                @change="handleStatusChange"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div
              role="group"
              aria-label="顯示方式"
              class="inline-flex rounded-lg border border-slate-300 p-1"
            >
              <button
                type="button"
                class="rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="
                  viewMode === 'calendar'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                "
                :aria-pressed="viewMode === 'calendar'"
                @click="viewMode = 'calendar'"
              >
                行事曆
              </button>

              <button
                type="button"
                class="rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                "
                :aria-pressed="viewMode === 'list'"
                @click="viewMode = 'list'"
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Summary -->
      <p
        class="mt-5 text-sm text-slate-600"
        aria-live="polite"
      >
        本月共
        <span class="font-semibold text-slate-900">
          {{ interviewStore.pagination.total }}
        </span>
        場面試，其中
        <span class="font-semibold text-slate-900">{{ upcomingCount }}</span>
        場尚未進行
      </p>

      <ErrorState
        v-if="interviewStore.error"
        class="mt-4"
        :message="interviewStore.error"
        show-retry
        @retry="interviewStore.fetchInterviews()"
      />

      <section
        class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState
          v-if="interviewStore.loading"
          message="載入面試資料中..."
        />

        <!-- Calendar -->
        <div
          v-else-if="viewMode === 'calendar'"
          class="overflow-x-auto"
        >
          <InterviewCalendar
            :year="year"
            :month="month"
            :interviews="interviewStore.interviews"
            @select="openInterview"
          />
        </div>

        <!-- List -->
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="min-w-full divide-y divide-slate-200">
            <caption class="sr-only">
              {{ monthTitle }}面試列表
            </caption>

            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  日期時間
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  候選人 / 職缺
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  階段
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  面試官
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  方式
                </th>

                <th
                  scope="col"
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  狀態
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="interviewStore.interviews.length === 0">
                <td colspan="6">
                  <EmptyState
                    title="本月沒有面試"
                    description="請切換月份或調整篩選條件"
                  />
                </td>
              </tr>

              <tr
                v-for="interview in interviewStore.interviews"
                v-else
                :key="interview.id"
                class="transition hover:bg-slate-50"
              >
                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ interview.date }} {{ interview.time }}
                </td>

                <td class="px-5 py-4">
                  <RouterLink
                    :to="{ name: 'interview-detail', params: { id: interview.id } }"
                    class="rounded font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ interview.candidateName }}
                  </RouterLink>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ interview.jobTitle }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ INTERVIEW_STAGE_LABELS[interview.stage] }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ interview.interviewerName }}
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {{ INTERVIEW_MODE_LABELS[interview.mode] }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    :label="INTERVIEW_STATUS_LABELS[interview.status]"
                    :tone="INTERVIEW_STATUS_TONES[interview.status]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
