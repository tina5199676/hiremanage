<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppAlert from '../../components/AppAlert.vue'
import FormField from '../../components/FormField.vue'
import PageHeader from '../../components/PageHeader.vue'
import { useApplicationStore } from '../../stores/application'
import { useCandidateStore } from '../../stores/candidate'
import { useJobStore } from '../../stores/job'
import { APPLICATION_STATUS_LABELS, toOptions } from '../../utils/labels'
import { validateApplicationForm } from '../../utils/validators'

import type { ApplicationStatus } from '../../types/application'
import type {
  ApplicationFormErrors,
  ApplicationFormInput,
} from '../../utils/validators'

const router = useRouter()
const applicationStore = useApplicationStore()
const candidateStore = useCandidateStore()
const jobStore = useJobStore()

const statusOptions = toOptions(APPLICATION_STATUS_LABELS)

const form = reactive<ApplicationFormInput>({
  candidateId: '',
  jobId: '',
  status: 'applied',
  note: '',
})

const errors = ref<ApplicationFormErrors>({})

const openJobs = computed(() =>
  jobStore.jobs.filter((job) => job.status === 'open'),
)

const optionsLoading = computed(
  () => candidateStore.loading || jobStore.loading,
)

const optionsError = computed(
  () => candidateStore.error ?? jobStore.error ?? null,
)

async function handleSubmit() {
  errors.value = validateApplicationForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const created = await applicationStore.createApplication({
    candidateId: Number(form.candidateId),
    jobId: Number(form.jobId),
    status: form.status as ApplicationStatus,
    note: form.note.trim(),
  })

  if (created) {
    router.push({ name: 'application-detail', params: { id: created.id } })
  }
}

function handleCancel() {
  router.push({ name: 'applications' })
}

const inputClass =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2'

function fieldClass(invalid: boolean) {
  return invalid
    ? `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${inputClass} border-slate-300 focus:border-blue-500 focus:ring-blue-100`
}

onMounted(async () => {
  // 建立表單需要完整的候選人與職缺清單作為選項
  candidateStore.setQuery({ page: 1, pageSize: 100, search: undefined })
  jobStore.setQuery({ page: 1, pageSize: 100, search: undefined })

  await Promise.all([
    candidateStore.fetchCandidates(),
    jobStore.fetchJobs(),
  ])

  candidateStore.resetQuery()
  jobStore.resetQuery()
})
</script>

<template>
  <div>
    <PageHeader
      title="建立應徵"
      description="為候選人建立一筆新的職缺應徵紀錄"
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'applications' }"
          class="rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← 返回應徵管理
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-3xl px-6 py-6">
      <form
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <AppAlert
          v-if="applicationStore.createError"
          class="mb-5"
          :message="applicationStore.createError"
        />

        <AppAlert
          v-if="optionsError"
          class="mb-5"
          :message="optionsError"
        />

        <div class="grid gap-5 sm:grid-cols-2">
          <FormField
            id="application-candidate"
            label="候選人"
            :error="errors.candidateId"
            required
          >
            <template #default="{ id, describedBy, invalid }">
              <select
                :id="id"
                v-model="form.candidateId"
                :class="fieldClass(invalid)"
                class="bg-white"
                :disabled="optionsLoading"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
              >
                <option value="">
                  {{ optionsLoading ? '載入中...' : '請選擇候選人' }}
                </option>

                <option
                  v-for="candidate in candidateStore.candidates"
                  :key="candidate.id"
                  :value="String(candidate.id)"
                >
                  {{ candidate.name }}（{{ candidate.currentTitle }}）
                </option>
              </select>
            </template>
          </FormField>

          <FormField
            id="application-job"
            label="職缺"
            hint="僅列出開放中的職缺"
            :error="errors.jobId"
            required
          >
            <template #default="{ id, describedBy, invalid }">
              <select
                :id="id"
                v-model="form.jobId"
                :class="fieldClass(invalid)"
                class="bg-white"
                :disabled="optionsLoading"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
              >
                <option value="">
                  {{ optionsLoading ? '載入中...' : '請選擇職缺' }}
                </option>

                <option
                  v-for="job in openJobs"
                  :key="job.id"
                  :value="String(job.id)"
                >
                  {{ job.title }}（{{ job.department }}）
                </option>
              </select>
            </template>
          </FormField>

          <FormField
            id="application-status"
            label="狀態"
            :error="errors.status"
            required
          >
            <template #default="{ id, describedBy, invalid }">
              <select
                :id="id"
                v-model="form.status"
                :class="fieldClass(invalid)"
                class="bg-white"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </template>
          </FormField>

          <FormField
            id="application-note"
            class="sm:col-span-2"
            label="備註"
            hint="最多 500 字"
            :error="errors.note"
          >
            <template #default="{ id, describedBy, invalid }">
              <textarea
                :id="id"
                v-model="form.note"
                rows="4"
                maxlength="500"
                :class="fieldClass(invalid)"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
              />
            </template>
          </FormField>
        </div>

        <div class="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-6">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            :disabled="applicationStore.createLoading"
            @click="handleCancel"
          >
            取消
          </button>

          <button
            type="submit"
            class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="applicationStore.createLoading"
          >
            {{ applicationStore.createLoading ? '建立中...' : '建立應徵' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
