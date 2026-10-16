<script setup lang="ts">
import { computed, onMounted } from 'vue'

import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import TrendChart from '../../components/TrendChart.vue'
import { useAuthStore } from '../../stores/auth'
import { useDashboardStore } from '../../stores/dashboard'
import { formatDate } from '../../utils/formatters'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from '../../utils/labels'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const data = computed(() => dashboardStore.data)

const statTiles = computed(() => {
  if (!data.value) {
    return []
  }

  const { stats } = data.value

  return [
    {
      label: '開放職缺',
      value: stats.openJobs,
      hint: `共 ${stats.totalJobs} 個職缺`,
      to: '/admin/jobs',
      permission: 'job.read' as const,
    },
    {
      label: '候選人',
      value: stats.candidates,
      hint: `${stats.activeCandidates} 位應徵中`,
      to: '/admin/candidates',
      permission: 'candidate.read' as const,
    },
    {
      label: '應徵',
      value: stats.applications,
      hint: `本月新增 ${stats.applicationsThisMonth} 筆`,
      to: '/admin/applications',
      permission: 'application.read' as const,
    },
    {
      label: '排定面試',
      value: stats.scheduledInterviews,
      hint: `本週 ${stats.interviewsThisWeek} 場`,
      to: '/admin/interviews',
      permission: 'interview.read' as const,
    },
    {
      label: 'Offer',
      value: stats.offers,
      hint: `${stats.pendingOffers} 份等待回覆`,
      to: '/admin/offers',
      permission: 'offer.read' as const,
    },
  ].filter((tile) => authStore.can(tile.permission))
})

const funnelMax = computed(() => {
  if (!data.value) {
    return 1
  }

  return Math.max(1, ...data.value.funnel.map((step) => step.count))
})

function funnelWidth(count: number): string {
  return `${Math.max(2, (count / funnelMax.value) * 100)}%`
}

function conversion(index: number): string | null {
  if (!data.value || index === 0) {
    return null
  }

  const previous = data.value.funnel[index - 1].count
  const current = data.value.funnel[index].count

  if (previous === 0) {
    return null
  }

  return `${Math.round((current / previous) * 100)}%`
}

onMounted(() => {
  dashboardStore.fetchDashboard()
})
</script>

<template>
  <div>
    <PageHeader
      title="總覽"
      :description="`歡迎回來，${authStore.user?.name ?? ''}。以下是目前的招聘狀況。`"
    />

    <div class="mx-auto max-w-7xl px-6 py-6">
      <section
        v-if="dashboardStore.loading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入總覽資料中..." />
      </section>

      <ErrorState
        v-else-if="dashboardStore.error"
        :message="dashboardStore.error"
        show-retry
        @retry="dashboardStore.fetchDashboard()"
      />

      <template v-else-if="data">
        <!-- Stats -->
        <section aria-labelledby="dashboard-stats-title">
          <h2
            id="dashboard-stats-title"
            class="sr-only"
          >
            招聘總覽
          </h2>

          <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <li
              v-for="tile in statTiles"
              :key="tile.label"
            >
              <component
                :is="tile.to ? 'RouterLink' : 'div'"
                :to="tile.to ?? undefined"
                class="block h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition"
                :class="tile.to ? 'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''"
              >
                <p class="text-sm text-slate-500">
                  {{ tile.label }}
                </p>

                <p class="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {{ tile.value }}
                </p>

                <p class="mt-1 text-xs text-slate-500">
                  {{ tile.hint }}
                </p>
              </component>
            </li>
          </ul>
        </section>

        <div class="mt-6 grid gap-5 lg:grid-cols-5">
          <!-- Trend -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3"
            aria-labelledby="dashboard-trend-title"
          >
            <h2
              id="dashboard-trend-title"
              class="sr-only"
            >
              應徵趨勢
            </h2>

            <TrendChart
              :points="data.trend"
              title="應徵趨勢"
            />
          </section>

          <!-- Funnel -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
            aria-labelledby="dashboard-funnel-title"
          >
            <h2
              id="dashboard-funnel-title"
              class="text-sm font-semibold text-slate-900"
            >
              招聘漏斗
            </h2>

            <p class="mt-1 text-xs text-slate-500">
              到達各階段的應徵數與前一階段的轉換率
            </p>

            <ol class="mt-4 space-y-3">
              <li
                v-for="(step, index) in data.funnel"
                :key="step.status"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-700">
                    {{ APPLICATION_STATUS_LABELS[step.status] }}
                  </span>

                  <span class="tabular-nums text-slate-900">
                    {{ step.count }}
                    <span
                      v-if="conversion(index)"
                      class="ml-1 text-xs text-slate-500"
                    >
                      ({{ conversion(index) }})
                    </span>
                  </span>
                </div>

                <div
                  class="mt-1 h-2 w-full rounded-full bg-slate-100"
                  role="presentation"
                >
                  <div
                    class="h-2 rounded-full bg-blue-600"
                    :style="{ width: funnelWidth(step.count) }"
                  />
                </div>
              </li>
            </ol>
          </section>
        </div>

        <!-- Recent applications -->
        <section
          class="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          aria-labelledby="dashboard-recent-title"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2
              id="dashboard-recent-title"
              class="text-sm font-semibold text-slate-900"
            >
              最近應徵
            </h2>

            <RouterLink
              v-if="authStore.can('application.read')"
              to="/admin/applications"
              class="rounded text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              查看全部
            </RouterLink>
          </div>

          <EmptyState
            v-if="data.recentApplications.length === 0"
            title="目前沒有應徵紀錄"
          />

          <div
            v-else
            class="overflow-x-auto"
          >
            <table class="min-w-full divide-y divide-slate-200">
              <caption class="sr-only">
                最近五筆應徵
              </caption>

              <thead class="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    候選人
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    職缺
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    狀態
                  </th>

                  <th
                    scope="col"
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    應徵日期
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-200">
                <tr
                  v-for="application in data.recentApplications"
                  :key="application.id"
                  class="transition hover:bg-slate-50"
                >
                  <td class="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-900">
                    <RouterLink
                      v-if="authStore.can('application.read')"
                      :to="{ name: 'application-detail', params: { id: application.id } }"
                      class="rounded hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {{ application.candidateName }}
                    </RouterLink>

                    <template v-else>
                      {{ application.candidateName }}
                    </template>
                  </td>

                  <td class="px-5 py-3 text-sm text-slate-700">
                    {{ application.jobTitle }}
                  </td>

                  <td class="whitespace-nowrap px-5 py-3">
                    <StatusBadge
                      :label="APPLICATION_STATUS_LABELS[application.status]"
                      :tone="APPLICATION_STATUS_TONES[application.status]"
                    />
                  </td>

                  <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
                    {{ formatDate(application.appliedAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
