<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '../../components/ConfirmDialog.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import FormField from '../../components/FormField.vue'
import LoadingState from '../../components/LoadingState.vue'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useCandidateStore } from '../../stores/candidate'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '../../utils/formatters'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_TONES,
  INTERVIEW_STAGE_LABELS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUS_TONES,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_TONES,
} from '../../utils/labels'
import { validateNoteContent } from '../../utils/validators'

import type { CandidateNote } from '../../types/candidate'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()
const authStore = useAuthStore()

const candidateId = computed(() => Number(route.params.id))

const isValidId = computed(
  () => Number.isInteger(candidateId.value) && candidateId.value > 0,
)

const candidate = computed(() => candidateStore.selectedCandidate)

const canUpdate = computed(() => authStore.can('candidate.update'))
const canDelete = computed(() => authStore.can('candidate.delete'))
const canNote = computed(() => authStore.can('candidate.note'))
const isAdmin = computed(() => authStore.permissions.includes('*'))

// --------------------------------------------------
// Delete candidate
// --------------------------------------------------

const confirmDeleteOpen = ref(false)

async function confirmDelete() {
  const success = await candidateStore.deleteCandidate(candidateId.value)

  confirmDeleteOpen.value = false

  if (success) {
    router.push({ name: 'candidates' })
  }
}

// --------------------------------------------------
// Notes
// --------------------------------------------------

const noteContent = ref('')
const noteError = ref<string | undefined>(undefined)
const noteToDelete = ref<CandidateNote | null>(null)

function canDeleteNote(note: CandidateNote) {
  return canNote.value && (isAdmin.value || note.authorId === authStore.user?.id)
}

async function submitNote() {
  const validationError = validateNoteContent(noteContent.value)

  noteError.value = validationError ?? undefined

  if (validationError) {
    return
  }

  const success = await candidateStore.addNote(
    candidateId.value,
    noteContent.value.trim(),
  )

  if (success) {
    noteContent.value = ''
  }
}

async function confirmDeleteNote() {
  if (!noteToDelete.value) {
    return
  }

  await candidateStore.removeNote(candidateId.value, noteToDelete.value.id)

  noteToDelete.value = null
}

// --------------------------------------------------
// Load
// --------------------------------------------------

async function load() {
  if (!isValidId.value) {
    return
  }

  await candidateStore.fetchCandidateById(candidateId.value)

  if (candidateStore.selectedCandidate) {
    candidateStore.fetchNotes(candidateId.value)
    candidateStore.fetchHistory(candidateId.value)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      title="候選人詳細資料"
      :description="candidate?.name"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'candidates' }"
          class="rounded px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回候選人列表
        </RouterLink>

        <RouterLink
          v-if="candidate && canUpdate"
          :to="{ name: 'candidate-edit', params: { id: candidateId } }"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          編輯候選人
        </RouterLink>

        <button
          v-if="candidate && canDelete"
          type="button"
          class="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="candidateStore.deleteLoading"
          @click="confirmDeleteOpen = true"
        >
          刪除候選人
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-6xl px-6 py-6">
      <ErrorState
        v-if="candidateStore.deleteError"
        class="mb-5"
        :message="candidateStore.deleteError"
      />

      <section
        v-if="candidateStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <LoadingState message="載入候選人資料中..." />
      </section>

      <ErrorState
        v-else-if="candidateStore.detailError"
        :message="candidateStore.detailError"
        show-retry
        @retry="load"
      />

      <section
        v-else-if="!isValidId || !candidate"
        class="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <EmptyState
          title="找不到指定的候選人"
          description="此候選人可能已被刪除或不存在"
        >
          <RouterLink
            :to="{ name: 'candidates' }"
            class="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            返回候選人列表
          </RouterLink>
        </EmptyState>
      </section>

      <div
        v-else
        class="grid gap-5 lg:grid-cols-3"
      >
        <!-- Left column -->
        <div class="space-y-5 lg:col-span-2">
          <!-- Basic information -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="candidate-basic-title"
          >
            <div class="flex flex-wrap items-center gap-3">
              <h2
                id="candidate-basic-title"
                class="text-2xl font-bold text-slate-900"
              >
                {{ candidate.name }}
              </h2>

              <StatusBadge
                :label="CANDIDATE_STATUS_LABELS[candidate.status]"
                :tone="CANDIDATE_STATUS_TONES[candidate.status]"
              />
            </div>

            <p class="mt-2 text-sm text-slate-500">
              {{ candidate.currentTitle }} ・ {{ candidate.currentCompany }}
            </p>

            <dl class="mt-6 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-slate-500">Email</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  <a
                    :href="`mailto:${candidate.email}`"
                    class="rounded hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ candidate.email }}
                  </a>
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">電話</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ candidate.phone }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">所在地</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ candidate.location }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">來源</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ CANDIDATE_SOURCE_LABELS[candidate.source] }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">工作經驗</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ candidate.experience }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">學歷</dt>
                <dd class="mt-1 text-sm font-medium text-slate-900">
                  {{ candidate.education }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- Resume -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="candidate-resume-title"
          >
            <h3
              id="candidate-resume-title"
              class="text-base font-semibold text-slate-900"
            >
              履歷
            </h3>

            <template v-if="candidate.resume">
              <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {{ candidate.resume.summary }}
              </p>

              <p class="mt-3 text-xs text-slate-500">
                {{ candidate.resume.fileName }} ・ 上傳於
                {{ formatDate(candidate.resume.uploadedAt) }}
              </p>
            </template>

            <p
              v-else
              class="mt-3 text-sm text-slate-500"
            >
              尚未上傳履歷
            </p>
          </section>

          <!-- Skills -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="candidate-skills-title"
          >
            <h3
              id="candidate-skills-title"
              class="text-base font-semibold text-slate-900"
            >
              技能
            </h3>

            <ul class="mt-4 flex flex-wrap gap-2">
              <li
                v-for="skill in candidate.skills"
                :key="skill"
                class="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
              >
                {{ skill }}
              </li>
            </ul>
          </section>

          <!-- History -->
          <section
            class="rounded-xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby="candidate-history-title"
          >
            <div class="border-b border-slate-200 px-6 py-4">
              <h3
                id="candidate-history-title"
                class="text-base font-semibold text-slate-900"
              >
                招聘紀錄
              </h3>
            </div>

            <LoadingState
              v-if="candidateStore.historyLoading"
              message="載入招聘紀錄中..."
            />

            <div
              v-else-if="candidateStore.historyError"
              class="p-6"
            >
              <ErrorState
                :message="candidateStore.historyError"
                show-retry
                @retry="candidateStore.fetchHistory(candidateId)"
              />
            </div>

            <div
              v-else-if="candidateStore.history"
              class="divide-y divide-slate-200"
            >
              <!-- Applications -->
              <div class="px-6 py-5">
                <h4 class="text-sm font-semibold text-slate-700">
                  應徵紀錄
                </h4>

                <p
                  v-if="candidateStore.history.applications.length === 0"
                  class="mt-2 text-sm text-slate-500"
                >
                  目前沒有應徵紀錄
                </p>

                <ul
                  v-else
                  class="mt-3 space-y-2"
                >
                  <li
                    v-for="application in candidateStore.history.applications"
                    :key="application.id"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <RouterLink
                        :to="{ name: 'application-detail', params: { id: application.id } }"
                        class="rounded text-sm font-medium text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {{ application.jobTitle }}
                      </RouterLink>

                      <p class="mt-0.5 text-xs text-slate-500">
                        {{ application.jobDepartment }} ・ 應徵於
                        {{ formatDate(application.appliedAt) }}
                      </p>
                    </div>

                    <StatusBadge
                      :label="APPLICATION_STATUS_LABELS[application.status]"
                      :tone="APPLICATION_STATUS_TONES[application.status]"
                    />
                  </li>
                </ul>
              </div>

              <!-- Interviews -->
              <div class="px-6 py-5">
                <h4 class="text-sm font-semibold text-slate-700">
                  面試紀錄
                </h4>

                <p
                  v-if="candidateStore.history.interviews.length === 0"
                  class="mt-2 text-sm text-slate-500"
                >
                  目前沒有面試紀錄
                </p>

                <ul
                  v-else
                  class="mt-3 space-y-2"
                >
                  <li
                    v-for="interview in candidateStore.history.interviews"
                    :key="interview.id"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p class="text-sm font-medium text-slate-900">
                        <RouterLink
                          :to="{ name: 'interview-detail', params: { id: interview.id } }"
                          class="rounded hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {{ INTERVIEW_STAGE_LABELS[interview.stage] }} ・
                          {{ interview.jobTitle }}
                        </RouterLink>
                      </p>

                      <p class="mt-0.5 text-xs text-slate-500">
                        {{ interview.date }} {{ interview.time }} ・ 面試官
                        {{ interview.interviewerName }}
                        <template v-if="interview.feedback">
                          ・ 評分 {{ interview.feedback.score }} / 5
                        </template>
                      </p>
                    </div>

                    <StatusBadge
                      :label="INTERVIEW_STATUS_LABELS[interview.status]"
                      :tone="INTERVIEW_STATUS_TONES[interview.status]"
                    />
                  </li>
                </ul>
              </div>

              <!-- Offers -->
              <div class="px-6 py-5">
                <h4 class="text-sm font-semibold text-slate-700">
                  Offer 紀錄
                </h4>

                <p
                  v-if="candidateStore.history.offers.length === 0"
                  class="mt-2 text-sm text-slate-500"
                >
                  目前沒有 Offer 紀錄
                </p>

                <ul
                  v-else
                  class="mt-3 space-y-2"
                >
                  <li
                    v-for="offer in candidateStore.history.offers"
                    :key="offer.id"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p class="text-sm font-medium text-slate-900">
                        {{ offer.jobTitle }}
                      </p>

                      <p class="mt-0.5 text-xs text-slate-500">
                        月薪 {{ formatCurrency(offer.salary) }} ・ 到職日
                        {{ offer.startDate }}
                      </p>
                    </div>

                    <StatusBadge
                      :label="OFFER_STATUS_LABELS[offer.status]"
                      :tone="OFFER_STATUS_TONES[offer.status]"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <!-- Right column -->
        <div class="space-y-5">
          <!-- Notes -->
          <section
            class="rounded-xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby="candidate-notes-title"
          >
            <div class="border-b border-slate-200 px-6 py-4">
              <h3
                id="candidate-notes-title"
                class="text-base font-semibold text-slate-900"
              >
                備註
              </h3>
            </div>

            <form
              v-if="canNote"
              class="border-b border-slate-200 px-6 py-4"
              novalidate
              @submit.prevent="submitNote"
            >
              <FormField
                id="candidate-note"
                label="新增備註"
                :error="noteError"
              >
                <template #default="{ id, describedBy, invalid }">
                  <textarea
                    :id="id"
                    v-model="noteContent"
                    rows="3"
                    maxlength="500"
                    placeholder="記錄與候選人溝通的重點..."
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

              <div class="mt-3 flex justify-end">
                <button
                  type="submit"
                  class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="candidateStore.noteSubmitting"
                >
                  {{ candidateStore.noteSubmitting ? '新增中...' : '新增備註' }}
                </button>
              </div>
            </form>

            <div
              v-if="candidateStore.notesError"
              class="px-6 pt-4"
            >
              <ErrorState :message="candidateStore.notesError" />
            </div>

            <LoadingState
              v-if="candidateStore.notesLoading"
              message="載入備註中..."
            />

            <EmptyState
              v-else-if="candidateStore.notes.length === 0"
              title="目前沒有備註"
            />

            <ul
              v-else
              class="divide-y divide-slate-200"
            >
              <li
                v-for="note in candidateStore.notes"
                :key="note.id"
                class="px-6 py-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-900">
                      {{ note.authorName }}
                    </p>

                    <p
                      class="text-xs text-slate-500"
                      :title="formatDateTime(note.createdAt)"
                    >
                      {{ formatRelativeTime(note.createdAt) }}
                    </p>
                  </div>

                  <button
                    v-if="canDeleteNote(note)"
                    type="button"
                    class="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    @click="noteToDelete = note"
                  >
                    刪除
                    <span class="sr-only">{{ note.authorName }} 的備註</span>
                  </button>
                </div>

                <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {{ note.content }}
                </p>
              </li>
            </ul>
          </section>

          <!-- System information -->
          <section
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="candidate-meta-title"
          >
            <h3
              id="candidate-meta-title"
              class="text-base font-semibold text-slate-900"
            >
              系統資訊
            </h3>

            <dl class="mt-4 space-y-4">
              <div>
                <dt class="text-xs font-medium text-slate-500">Candidate ID</dt>
                <dd class="mt-1 text-sm text-slate-700">{{ candidate.id }}</dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">建立時間</dt>
                <dd class="mt-1 text-sm text-slate-700">
                  {{ formatDateTime(candidate.createdAt) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-slate-500">更新時間</dt>
                <dd class="mt-1 text-sm text-slate-700">
                  {{ formatDateTime(candidate.updatedAt) }}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmDeleteOpen"
      title="刪除候選人"
      :message="`確定要刪除候選人「${candidate?.name ?? ''}」嗎？此動作無法復原。`"
      confirm-label="刪除"
      :loading="candidateStore.deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmDeleteOpen = false"
    />

    <ConfirmDialog
      :open="noteToDelete !== null"
      title="刪除備註"
      message="確定要刪除這則備註嗎？"
      confirm-label="刪除"
      @confirm="confirmDeleteNote"
      @cancel="noteToDelete = null"
    />
  </div>
</template>
