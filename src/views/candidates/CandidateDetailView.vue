<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCandidateStore } from '../../stores/candidate'

import type {
  CandidateStatus,
} from '../../types/candidate'

const route = useRoute()
const router = useRouter()

const candidateStore = useCandidateStore()

// --------------------------------------------------
// Route parameter
// --------------------------------------------------

const candidateId = computed(() => {
  return Number(route.params.id)
})

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getStatusLabel(
  status: CandidateStatus,
) {
  switch (status) {
    case 'active':
      return '在職應徵中'

    case 'inactive':
      return '未在聯繫'

    case 'hired':
      return '已錄取'

    default:
      return status
  }
}

function getStatusClass(
  status: CandidateStatus,
) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'

    case 'inactive':
      return 'bg-slate-100 text-slate-600'

    case 'hired':
      return 'bg-blue-50 text-blue-700'

    default:
      return 'bg-slate-100 text-slate-600'
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

function goBack() {
  router.push('/admin/candidates')
}

// --------------------------------------------------
// Fetch
// --------------------------------------------------

onMounted(() => {
  if (
    Number.isNaN(candidateId.value) ||
    candidateId.value <= 0
  ) {
    return
  }

  candidateStore.fetchCandidateById(
    candidateId.value,
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
            ← 返回候選人列表
          </button>

          <h1
            class="text-2xl font-bold text-slate-900"
          >
            候選人詳細資料
          </h1>
        </div>
      </div>
    </header>

    <div
      class="mx-auto max-w-5xl px-6 py-6"
    >
      <!-- Loading -->
      <section
        v-if="candidateStore.detailLoading"
        class="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <p
          class="text-sm text-slate-500"
        >
          載入候選人資料中...
        </p>
      </section>

      <!-- Error -->
      <section
        v-else-if="candidateStore.detailError"
        class="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <p
          class="text-sm font-medium text-red-700"
        >
          {{ candidateStore.detailError }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          @click="goBack"
        >
          返回候選人列表
        </button>
      </section>

      <!-- Not found -->
      <section
        v-else-if="
          !candidateStore.selectedCandidate
        "
        class="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <p
          class="text-sm font-medium text-slate-700"
        >
          找不到指定的候選人
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          @click="goBack"
        >
          返回候選人列表
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
                    candidateStore
                      .selectedCandidate
                      .name
                  }}
                </h2>

                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    getStatusClass(
                      candidateStore
                        .selectedCandidate
                        .status,
                    )
                  "
                >
                  {{
                    getStatusLabel(
                      candidateStore
                        .selectedCandidate
                        .status,
                    )
                  }}
                </span>
              </div>

              <p
                class="mt-2 text-sm text-slate-500"
              >
                {{
                  candidateStore
                    .selectedCandidate
                    .currentTitle
                }}
                ・
                {{
                  candidateStore
                    .selectedCandidate
                    .currentCompany
                }}
              </p>
            </div>
          </div>

          <div
            class="mt-6 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                Email
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  candidateStore
                    .selectedCandidate
                    .email
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                電話
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  candidateStore
                    .selectedCandidate
                    .phone
                }}
              </dd>
            </div>
          </div>
        </section>

        <!-- Candidate information -->
        <section
          class="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3
            class="text-base font-semibold text-slate-900"
          >
            候選人資訊
          </h3>

          <dl
            class="mt-5 grid gap-6 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                所在地點
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  candidateStore
                    .selectedCandidate
                    .location
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                來源
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  candidateStore
                    .selectedCandidate
                    .source
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
                  candidateStore
                    .selectedCandidate
                    .experience
                }}
              </dd>
            </div>

            <div>
              <dt
                class="text-xs font-medium text-slate-500"
              >
                學歷
              </dt>

              <dd
                class="mt-1 text-sm font-medium text-slate-900"
              >
                {{
                  candidateStore
                    .selectedCandidate
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
            技能
          </h3>

          <div
            class="mt-4 flex flex-wrap gap-2"
          >
            <span
              v-for="skill in candidateStore.selectedCandidate.skills"
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
                Candidate ID
              </dt>

              <dd
                class="mt-1 text-sm text-slate-700"
              >
                {{
                  candidateStore
                    .selectedCandidate
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
                    candidateStore
                      .selectedCandidate
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
                    candidateStore
                      .selectedCandidate
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
