<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import FormField from '../../components/FormField.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useApplicationStore } from '../../stores/application'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime } from '../../utils/formatters'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_STATUS_TONES,
} from '../../utils/labels'

import type { ApplicationStatus } from '../../types/application'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const authStore = useAuthStore()

const applicationId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(applicationId.value) && applicationId.value > 0,
)

const application = computed(() => applicationStore.selectedApplication)

const canUpdate = computed(() => authStore.can('application.update'))
const canDelete = computed(() => authStore.can('application.delete'))
const canScheduleInterview = computed(() =>
  authStore.can('interview.create'),
)

const statusOptions = APPLICATION_STATUS_ORDER.map((status) => ({
  value: status,
  label: APPLICATION_STATUS_LABELS[status],
}))

// --------------------------------------------------
// Status
// --------------------------------------------------

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as ApplicationStatus

  if (application.value && value !== application.value.status) {
    applicationStore.updateStatus(application.value.id, value)
  }
}

// --------------------------------------------------
// Note
// --------------------------------------------------

const noteDraft = ref('')
const noteError = ref<string | undefined>(undefined)
const noteSaved = ref(false)

watch(
  application,
  (value) => {
    noteDraft.value = value?.note ?? ''
  },
  { immediate: true },
)

async function saveNote() {
  if (!application.value) {
    return
  }

  noteSaved.value = false

  if (noteDraft.value.length > 500) {
    noteError.value = '備註不能超過 500 字'

    return
  }

  noteError.value = undefined

  const updated = await applicationStore.updateApplication(
    application.value.id,
    {
      status: application.value.status,
      note: noteDraft.value.trim(),
    },
  )

  noteSaved.value = updated !== null
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

const confirmOpen = ref(false)

async function confirmDelete() {
  const success = await applicationStore.deleteApplication(applicationId.value)

  confirmOpen.value = false

  if (success) {
    router.push({ name: 'applications' })
  }
}

function load() {
  if (isValidId.value) {
    applicationStore.fetchApplicationById(applicationId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="應徵詳細資料"
      :description="
        application ? `${application.candidateName} - ${application.jobTitle}` : undefined
      "
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'applications' }"
          class="rounded px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回應徵管理
        </RouterLink>

        <RouterLink
          v-if="application && canScheduleInterview"
          :to="{ name: 'interview-create', query: { applicationId: application.id } }"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          安排面試
        </RouterLink>

        <button
          v-if="application && canDelete"
          type="button"
          class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="applicationStore.deleteLoading"
          @click="confirmOpen = true"
        >
          刪除應徵
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-4xl px-6 py-6">
      <ErrorState
        v-if="applicationStore.deleteError"
        class="mb-5"
        :message="applicationStore.deleteError"
      />

      <ErrorState
        v-if="applicationStore.updateError"
        class="mb-5"
        :message="applicationStore.updateError"
      />

      <section
        v-if="applicationStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入應徵資料中..." />
      </section>

      <ErrorState
        v-else-if="applicationStore.detailError"
        :message="applicationStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !application"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定的應徵紀錄"
          description="此紀錄可能已被刪除或不存在"
        >
          <RouterLink
            :to="{ name: 'applications' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回應徵管理
          </RouterLink>
        </EmptyState>
      </section>

      <template v-else>
        <section
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="application-overview-title"
        >
          <div class="flex flex-wrap items-center gap-3">
            <h2
              id="application-overview-title"
              class="text-2xl font-bold text-slate-900"
            >
              {{ application.candidateName }}
            </h2>

            <StatusBadge
              :label="APPLICATION_STATUS_LABELS[application.status]"
              :tone="APPLICATION_STATUS_TONES[application.status]"
            />
          </div>

          <p class="mt-2 text-sm text-slate-500">
            應徵 {{ application.jobTitle }} ・ {{ application.jobDepartment }}
          </p>

          <dl class="mt-6 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-slate-500">候選人</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'candidate-detail', params: { id: application.candidateId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ application.candidateName }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">職缺</dt>
              <dd class="mt-1 text-sm font-medium">
                <RouterLink
                  :to="{ name: 'job-detail', params: { id: application.jobId } }"
                  class="rounded text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ application.jobTitle }}
                </RouterLink>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">應徵時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(application.appliedAt) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-slate-500">更新時間</dt>
              <dd class="mt-1 text-sm text-slate-700">
                {{ formatDateTime(application.updatedAt) }}
              </dd>
            </div>
          </dl>
        </section>

        <section
          v-if="canUpdate"
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="application-status-title"
        >
          <h3
            id="application-status-title"
            class="text-base font-semibold text-slate-900"
          >
            變更狀態
          </h3>

          <div class="mt-4 max-w-xs">
            <label
              for="application-status-select"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              目前狀態
            </label>

            <select
              id="application-status-select"
              :value="application.status"
              :disabled="applicationStore.statusUpdatingId === application.id"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        </section>

        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="application-note-title"
        >
          <h3
            id="application-note-title"
            class="text-base font-semibold text-slate-900"
          >
            備註
          </h3>

          <form
            v-if="canUpdate"
            class="mt-4"
            novalidate
            @submit.prevent="saveNote"
          >
            <FormField
              id="application-note"
              label="應徵備註"
              :error="noteError"
              hint="最多 500 字"
            >
              <template #default="{ id, describedBy, invalid }">
                <textarea
                  :id="id"
                  v-model="noteDraft"
                  rows="4"
                  maxlength="500"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2"
                  :class="
                    invalid
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  "
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid || undefined"
                />
              </template>
            </FormField>

            <div class="mt-3 flex items-center justify-end gap-3">
              <p
                v-if="noteSaved"
                role="status"
                class="text-sm text-emerald-700"
              >
                備註已儲存
              </p>

              <button
                type="submit"
                class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="applicationStore.updateLoading"
              >
                {{ applicationStore.updateLoading ? '儲存中...' : '儲存備註' }}
              </button>
            </div>
          </form>

          <p
            v-else
            class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600"
          >
            {{ application.note || '沒有備註' }}
          </p>
        </section>
      </template>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="刪除應徵紀錄"
      :message="`確定要刪除「${application?.candidateName ?? ''}」的應徵紀錄嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="applicationStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
