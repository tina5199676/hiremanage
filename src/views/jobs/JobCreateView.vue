<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useJobStore } from '../../stores/job'
import {
  validateJobForm,
} from '../../utils/validators'

import type {
  CreateJobInput,
  JobStatus,
  WorkType,
} from '../../types/job'
import type {
  JobFormErrors,
} from '../../utils/validators'

const router = useRouter()
const jobStore = useJobStore()

// --------------------------------------------------
// Options
// --------------------------------------------------

const workTypeOptions: Array<{
  label: string
  value: WorkType
}> = [
  {
    label: 'On-site',
    value: 'onsite',
  },
  {
    label: 'Remote',
    value: 'remote',
  },
  {
    label: 'Hybrid',
    value: 'hybrid',
  },
]

const statusOptions: Array<{
  label: string
  value: JobStatus
}> = [
  {
    label: '草稿',
    value: 'draft',
  },
  {
    label: '開放中',
    value: 'open',
  },
  {
    label: '已關閉',
    value: 'closed',
  },
]

// --------------------------------------------------
// Form state
// --------------------------------------------------

const form = reactive({
  title: '',
  description: '',
  department: '',
  location: '',
  workType: '' as WorkType | '',
  salaryMin: '',
  salaryMax: '',
  experience: '',
  education: '',
  requiredSkills: '',
  status: '' as JobStatus | '',
})

const errors = ref<JobFormErrors>({})

// --------------------------------------------------
// Submit
// --------------------------------------------------

async function handleSubmit() {
  errors.value = validateJobForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const payload: CreateJobInput = {
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
  }

  const createdJob =
    await jobStore.createJob(payload)

  if (createdJob) {
    router.push(
      `/admin/jobs/${createdJob.id}`,
    )
  }
}

function handleCancel() {
  router.push('/admin/jobs')
}
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header
      class="border-b border-slate-200 bg-white"
    >
      <div
        class="mx-auto max-w-3xl px-6 py-5"
      >
        <button
          type="button"
          class="mb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          @click="handleCancel"
        >
          ← 返回職缺列表
        </button>

        <h1
          class="text-2xl font-bold text-slate-900"
        >
          建立職缺
        </h1>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          填寫以下資訊以建立新的職缺
        </p>
      </div>
    </header>

    <div
      class="mx-auto max-w-3xl px-6 py-6"
    >
      <!-- Submit error -->
      <div
        v-if="jobStore.createError"
        class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ jobStore.createError }}
      </div>

      <form
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Title -->
          <div class="sm:col-span-2">
            <label
              for="job-title"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              職缺名稱
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-title"
              v-model="form.title"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.title"
              aria-describedby="job-title-error"
            />

            <p
              v-if="errors.title"
              id="job-title-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.title }}
            </p>
          </div>

          <!-- Description -->
          <div class="sm:col-span-2">
            <label
              for="job-description"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              職缺描述
              <span class="text-red-500">*</span>
            </label>

            <textarea
              id="job-description"
              v-model="form.description"
              rows="4"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.description"
              aria-describedby="job-description-error"
            ></textarea>

            <p
              v-if="errors.description"
              id="job-description-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.description }}
            </p>
          </div>

          <!-- Department -->
          <div>
            <label
              for="job-department"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              部門
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-department"
              v-model="form.department"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.department"
              aria-describedby="job-department-error"
            />

            <p
              v-if="errors.department"
              id="job-department-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.department }}
            </p>
          </div>

          <!-- Location -->
          <div>
            <label
              for="job-location"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              工作地點
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-location"
              v-model="form.location"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.location"
              aria-describedby="job-location-error"
            />

            <p
              v-if="errors.location"
              id="job-location-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.location }}
            </p>
          </div>

          <!-- Work type -->
          <div>
            <label
              for="job-work-type"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              工作型態
              <span class="text-red-500">*</span>
            </label>

            <select
              id="job-work-type"
              v-model="form.workType"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.workType"
              aria-describedby="job-work-type-error"
            >
              <option value="" disabled>
                請選擇工作型態
              </option>

              <option
                v-for="option in workTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <p
              v-if="errors.workType"
              id="job-work-type-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.workType }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label
              for="job-status"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              職缺狀態
              <span class="text-red-500">*</span>
            </label>

            <select
              id="job-status"
              v-model="form.status"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.status"
              aria-describedby="job-status-error"
            >
              <option value="" disabled>
                請選擇職缺狀態
              </option>

              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <p
              v-if="errors.status"
              id="job-status-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.status }}
            </p>
          </div>

          <!-- Salary min -->
          <div>
            <label
              for="job-salary-min"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              最低薪資
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-salary-min"
              v-model="form.salaryMin"
              type="number"
              min="0"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.salaryMin"
              aria-describedby="job-salary-min-error"
            />

            <p
              v-if="errors.salaryMin"
              id="job-salary-min-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.salaryMin }}
            </p>
          </div>

          <!-- Salary max -->
          <div>
            <label
              for="job-salary-max"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              最高薪資
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-salary-max"
              v-model="form.salaryMax"
              type="number"
              min="0"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.salaryMax"
              aria-describedby="job-salary-max-error"
            />

            <p
              v-if="errors.salaryMax"
              id="job-salary-max-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.salaryMax }}
            </p>
          </div>

          <!-- Experience -->
          <div>
            <label
              for="job-experience"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              經驗要求
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-experience"
              v-model="form.experience"
              type="text"
              placeholder="例如：3+ years"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.experience"
              aria-describedby="job-experience-error"
            />

            <p
              v-if="errors.experience"
              id="job-experience-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.experience }}
            </p>
          </div>

          <!-- Education -->
          <div>
            <label
              for="job-education"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              學歷要求
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-education"
              v-model="form.education"
              type="text"
              placeholder="例如：Bachelor"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.education"
              aria-describedby="job-education-error"
            />

            <p
              v-if="errors.education"
              id="job-education-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.education }}
            </p>
          </div>

          <!-- Required skills -->
          <div class="sm:col-span-2">
            <label
              for="job-required-skills"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              必要技能
              <span class="text-red-500">*</span>
            </label>

            <input
              id="job-required-skills"
              v-model="form.requiredSkills"
              type="text"
              placeholder="以逗號分隔，例如：Vue 3, TypeScript, Tailwind CSS"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :aria-invalid="!!errors.requiredSkills"
              aria-describedby="job-required-skills-error"
            />

            <p
              v-if="errors.requiredSkills"
              id="job-required-skills-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.requiredSkills }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6"
        >
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            :disabled="jobStore.createLoading"
            @click="handleCancel"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="jobStore.createLoading"
          >
            {{
              jobStore.createLoading
                ? '建立中...'
                : 'Create Job'
            }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
