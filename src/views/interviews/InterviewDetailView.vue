<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import InterviewFeedbackForm from '../../components/InterviewFeedbackForm.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useInterviewStore } from '../../stores/interview'
import { formatDateTime } from '../../utils/formatters'
import {
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STAGE_LABELS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUS_TONES,
} from '../../utils/labels'

import type { SubmitFeedbackInput } from '../../types/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const authStore = useAuthStore()

const interviewId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(interviewId.value) && interviewId.value > 0,
)

const interview = computed(() => interviewStore.selectedInterview)

const canUpdate = computed(() => authStore.can('interview.update'))
const canDelete = computed(() => authStore.can('interview.delete'))

/**
 * 回饋只能由被指派的面試官（或 System Admin）填寫，
 * 且已取消的面試不可填寫。與 Mock API 的規則一致。
 */
const canSubmitFeedback = computed(() => {
  if (!interview.value || !authStore.user) {
    return false
  }

  if (!authStore.can('interview.feedback')) {
    return false
  }

  if (interview.value.status === 'cancelled') {
    return false
  }

  const isAdmin = authStore.permissions.includes('*')

  return isAdmin || interview.value.interviewerId === authStore.user.id
})

// --------------------------------------------------
// Feedback
// --------------------------------------------------

const feedbackFormOpen = ref(false)

const feedbackSaved = ref(false)

async function handleFeedbackSubmit(payload: SubmitFeedbackInput) {
  feedbackSaved.value = false

  const updated = await interviewStore.submitFeedback(
    interviewId.value,
    payload,
  )

  if (updated) {
    feedbackFormOpen.value = false
    feedbackSaved.value = true
  }
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const confirmOpen = ref(false)

async function confirmDelete() {
  const success = await interviewStore.deleteInterview(interviewId.value)

  confirmOpen.value = false

  if (success) {
    router.push({ name: 'interviews' })
  }
}

function load() {
  if (isValidId.value) {
    interviewStore.fetchInterviewById(interviewId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="面試詳細資料"
      :description="
        interview ? `${interview.candidateName} - ${interview.jobTitle}` : undefined
      "
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'interviews' }"
          class="rounded px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回面試管理
        </RouterLink>

        <RouterLink
          v-if="interview && canUpdate"
          :to="{ name: 'interview-edit', params: { id: interviewId } }"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          編輯面試
        </RouterLink>

        <button
          v-if="interview && canDelete"
          type="button"
          class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="interviewStore.deleteLoading"
          @click="confirmOpen = true"
        >
          刪除面試
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-4xl px-6 py-6">
      <ErrorState
        v-if="interviewStore.deleteError"
        class="mb-5"
        :message="interviewStore.deleteError"
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
        v-else-if="!isValidId || !interview"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定的面試"
          description="此面試可能已被刪除或不存在"
        >
          <RouterLink
            :to="{ name: 'interviews' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回面試管理
          </RouterLink>
        </EmptyState>
      </section>

      <template v-else>
        <!-- Overview -->
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="interview-overview-title"
        >
          <div class="flex flex-wrap items-center gap-3">
            <h2
              id="interview-overview-title"
              class="text-2xl font-bold text-slate-900"
            >
              {{ INTERVIEW_STAGE_LABELS[interview.stage] }}
            </h2>

            <StatusBadge
              :label="INTERVIEW_STATUS_LABELS[interview.status]"
              :tone="INTERVIEW_STATUS_TONES[interview.status]"
            />
          </div>

          <p class="mt-2 text-sm text-slate-500">
            {{ interview.date }} {{ interview.time }} ・ {{ interview.durationMinutes }} 分鐘 ・
            {{ INTERVIEW_MODE_LABELS[interview.mode] }}
          </p>

          <dl class="mt-6 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-slate-500">候選人</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'candidate-detail', params: { id: interview.candidateId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ interview.candidateName }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">職缺</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'job-detail', params: { id: interview.jobId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ interview.jobTitle }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">應徵紀錄</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'application-detail', params: { id: interview.applicationId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  查看應徵紀錄 #{{ interview.applicationId }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">面試官</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ interview.interviewerName }}
              </dd>
            </div>

            <div v-if="interview.meetingLink">
              <dt class="text-xs font-medium text-slate-500">會議連結</dt>
              <dd class="mt-1 text-sm">
                <a
                  :href="interview.meetingLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="break-all rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ interview.meetingLink }}
                </a>
              </dd>
            </div>

            <div v-if="interview.location">
              <dt class="text-xs font-medium text-slate-500">地點</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ interview.location }}
              </dd>
            </div>
          </dl>

          <div
            v-if="interview.notes"
            class="mt-6 border-t border-slate-200 pt-6"
          >
            <h3 class="text-sm font-semibold text-slate-900">
              備註
            </h3>

            <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
              {{ interview.notes }}
            </p>
          </div>
        </section>

        <!-- Feedback -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="interview-feedback-title"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3
              id="interview-feedback-title"
              class="text-base font-semibold text-slate-900"
            >
              面試回饋
            </h3>

            <button
              v-if="canSubmitFeedback && !feedbackFormOpen"
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              @click="feedbackFormOpen = true"
            >
              {{ interview.feedback ? '修改回饋' : '填寫回饋' }}
            </button>
          </div>

          <p
            v-if="feedbackSaved"
            role="status"
            class="mt-3 text-sm text-emerald-700"
          >
            回饋已送出
          </p>

          <div
            v-if="feedbackFormOpen"
            class="mt-4"
          >
            <InterviewFeedbackForm
              :initial="interview.feedback"
              :submitting="interviewStore.feedbackLoading"
              :submit-error="interviewStore.feedbackError"
              @submit="handleFeedbackSubmit"
              @cancel="feedbackFormOpen = false"
            />
          </div>

          <template v-else-if="interview.feedback">
            <dl class="mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <dt class="text-xs font-medium text-slate-500">評分</dt>
                <dd class="mt-1 text-2xl font-bold text-slate-900">
                  {{ interview.feedback.score }}
                  <span class="text-sm font-normal text-slate-500">/ 5</span>
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">提交者</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ interview.feedback.submittedByName }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">提交時間</dt>
                <dd class="mt-1 text-sm text-slate-700">
                  {{ formatDateTime(interview.feedback.submittedAt) }}
                </dd>
              </div>
            </dl>

            <div class="mt-5">
              <h4 class="text-sm font-semibold text-slate-900">
                回饋內容
              </h4>

              <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                {{ interview.feedback.feedback }}
              </p>
            </div>

            <div
              v-if="interview.feedback.notes"
              class="mt-5"
            >
              <h4 class="text-sm font-semibold text-slate-900">
                內部備註
              </h4>

              <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                {{ interview.feedback.notes }}
              </p>
            </div>
          </template>

          <p
            v-else
            class="mt-3 text-sm text-slate-500"
          >
            {{
              interview.status === 'cancelled'
                ? '此面試已取消，無法填寫回饋'
                : '尚未填寫面試回饋'
            }}
          </p>
        </section>

        <!-- Meta -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="interview-meta-title"
        >
          <h3
            id="interview-meta-title"
            class="text-base font-semibold text-slate-900"
          >
            系統資訊
          </h3>

          <dl class="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt class="text-xs font-medium text-slate-500">Interview ID</dt>
              <dd class="mt-1 text-sm text-slate-700">{{ interview.id }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">建立時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(interview.createdAt) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">更新時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(interview.updatedAt) }}
              </dd>
            </div>
          </dl>
        </section>
      </template>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="刪除面試"
      :message="`確定要刪除「${interview?.candidateName ?? ''}」的${interview ? INTERVIEW_STAGE_LABELS[interview.stage] : ''}嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="interviewStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
