<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import AppAlert from './AppAlert.vue'
import FormField from './FormField.vue'
import { JOB_STATUS_LABELS, WORK_TYPE_LABELS, toOptions } from '../utils/labels'
import { validateJobForm } from '../utils/validators'

import type { CreateJobInput, Job, JobStatus, WorkType } from '../types/job'
import type { JobFormErrors, JobFormInput } from '../utils/validators'

const props = withDefaults(
  defineProps<{
    initial?: Job | null
    submitting?: boolean
    submitError?: string | null
    submitLabel?: string
  }>(),
  {
    initial: null,
    submitting: false,
    submitError: null,
    submitLabel: '儲存',
  },
)

const emit = defineEmits<{
  submit: [payload: CreateJobInput]
  cancel: []
}>()

const workTypeOptions = toOptions(WORK_TYPE_LABELS)
const statusOptions = toOptions(JOB_STATUS_LABELS)

const form = reactive<JobFormInput>({
  title: '',
  description: '',
  department: '',
  location: '',
  workType: '',
  salaryMin: '',
  salaryMax: '',
  experience: '',
  education: '',
  requiredSkills: '',
  status: '',
})

const errors = ref<JobFormErrors>({})

function populate(job: Job | null) {
  if (!job) {
    return
  }

  form.title = job.title
  form.description = job.description
  form.department = job.department
  form.location = job.location
  form.workType = job.workType
  form.salaryMin = String(job.salaryMin)
  form.salaryMax = String(job.salaryMax)
  form.experience = job.experience
  form.education = job.education
  form.requiredSkills = job.requiredSkills.join(', ')
  form.status = job.status
}

watch(
  () => props.initial,
  (job) => populate(job),
  { immediate: true },
)

function handleSubmit() {
  errors.value = validateJobForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    department: form.department.trim(),
    location: form.location.trim(),
    workType: form.workType as WorkType,
    salaryMin: Number(form.salaryMin),
    salaryMax: Number(form.salaryMax),
    experience: form.experience.trim(),
    education: form.education.trim(),
    requiredSkills: form.requiredSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0),
    status: form.status as JobStatus,
  })
}

const inputClass =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2'

function fieldClass(invalid: boolean) {
  return invalid
    ? `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${inputClass} border-slate-300 focus:border-blue-500 focus:ring-blue-100`
}
</script>

<template>
  <form
    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <AppAlert
      v-if="submitError"
      class="mb-5"
      :message="submitError"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <FormField
        id="job-title"
        class="sm:col-span-2"
        label="職缺名稱"
        :error="errors.title"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.title"
            type="text"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-description"
        class="sm:col-span-2"
        label="職缺描述"
        :error="errors.description"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <textarea
            :id="id"
            v-model="form.description"
            rows="4"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-department"
        label="部門"
        :error="errors.department"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.department"
            type="text"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-location"
        label="工作地點"
        :error="errors.location"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.location"
            type="text"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-work-type"
        label="工作型態"
        :error="errors.workType"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.workType"
            :class="fieldClass(invalid)"
            class="bg-white"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              請選擇
            </option>

            <option
              v-for="option in workTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="job-status"
        label="職缺狀態"
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
            <option value="">
              請選擇
            </option>

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
        id="job-salary-min"
        label="最低薪資"
        :error="errors.salaryMin"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.salaryMin"
            type="number"
            min="0"
            step="1000"
            inputmode="numeric"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-salary-max"
        label="最高薪資"
        :error="errors.salaryMax"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.salaryMax"
            type="number"
            min="0"
            step="1000"
            inputmode="numeric"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-experience"
        label="經驗要求"
        :error="errors.experience"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.experience"
            type="text"
            placeholder="例如：3+ years"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-education"
        label="學歷要求"
        :error="errors.education"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.education"
            type="text"
            placeholder="例如：Bachelor"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="job-required-skills"
        class="sm:col-span-2"
        label="必要技能"
        hint="以逗號分隔，例如：Vue 3, TypeScript, Tailwind CSS"
        :error="errors.requiredSkills"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.requiredSkills"
            type="text"
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
        :disabled="submitting"
        @click="emit('cancel')"
      >
        取消
      </button>

      <button
        type="submit"
        class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? '儲存中...' : submitLabel }}
      </button>
    </div>
  </form>
</template>
