<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import AppAlert from './AppAlert.vue'
import FormField from './FormField.vue'
import {
  APPLICATION_STATUS_LABELS,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STAGE_LABELS,
  INTERVIEW_STATUS_LABELS,
  toOptions,
} from '../utils/labels'
import { validateInterviewForm } from '../utils/validators'

import type { Application } from '../types/application'
import type { User } from '../types/auth'
import type {
  CreateInterviewInput,
  Interview,
  InterviewMode,
  InterviewStage,
  InterviewStatus,
} from '../types/interview'
import type {
  InterviewFormErrors,
  InterviewFormInput,
} from '../utils/validators'

const props = withDefaults(
  defineProps<{
    initial?: Interview | null
    /** 建立時可由 query 預選應徵紀錄 */
    defaultApplicationId?: number | null
    applicationOptions?: Application[]
    interviewerOptions?: User[]
    optionsLoading?: boolean
    submitting?: boolean
    submitError?: string | null
    submitLabel?: string
  }>(),
  {
    initial: null,
    defaultApplicationId: null,
    applicationOptions: () => [],
    interviewerOptions: () => [],
    optionsLoading: false,
    submitting: false,
    submitError: null,
    submitLabel: '儲存',
  },
)

const emit = defineEmits<{
  submit: [payload: CreateInterviewInput]
  cancel: []
}>()

const stageOptions = toOptions(INTERVIEW_STAGE_LABELS)
const modeOptions = toOptions(INTERVIEW_MODE_LABELS)
const statusOptions = toOptions(INTERVIEW_STATUS_LABELS)

const form = reactive<InterviewFormInput>({
  applicationId: props.defaultApplicationId
    ? String(props.defaultApplicationId)
    : '',
  interviewerId: '',
  stage: '',
  date: '',
  time: '',
  durationMinutes: '60',
  mode: '',
  meetingLink: '',
  location: '',
  notes: '',
  status: 'scheduled',
})

const errors = ref<InterviewFormErrors>({})

function populate(interview: Interview | null) {
  if (!interview) {
    return
  }

  form.applicationId = String(interview.applicationId)
  form.interviewerId = String(interview.interviewerId)
  form.stage = interview.stage
  form.date = interview.date
  form.time = interview.time
  form.durationMinutes = String(interview.durationMinutes)
  form.mode = interview.mode
  form.meetingLink = interview.meetingLink
  form.location = interview.location
  form.notes = interview.notes
  form.status = interview.status
}

watch(
  () => props.initial,
  (interview) => populate(interview),
  { immediate: true },
)

function handleSubmit() {
  errors.value = validateInterviewForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    applicationId: Number(form.applicationId),
    interviewerId: Number(form.interviewerId),
    stage: form.stage as InterviewStage,
    date: form.date,
    time: form.time,
    durationMinutes: Number(form.durationMinutes),
    mode: form.mode as InterviewMode,
    meetingLink: form.meetingLink.trim(),
    location: form.location.trim(),
    notes: form.notes.trim(),
    status: form.status as InterviewStatus,
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
        id="interview-application"
        class="sm:col-span-2"
        label="應徵紀錄"
        hint="候選人與職缺由應徵紀錄決定"
        :error="errors.applicationId"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.applicationId"
            :class="fieldClass(invalid)"
            class="bg-white"
            :disabled="optionsLoading"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              {{ optionsLoading ? '載入中...' : '請選擇應徵紀錄' }}
            </option>

            <option
              v-for="application in applicationOptions"
              :key="application.id"
              :value="String(application.id)"
            >
              {{ application.candidateName }} - {{ application.jobTitle }}（{{
                APPLICATION_STATUS_LABELS[application.status]
              }}）
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="interview-interviewer"
        label="面試官"
        :error="errors.interviewerId"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.interviewerId"
            :class="fieldClass(invalid)"
            class="bg-white"
            :disabled="optionsLoading"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              {{ optionsLoading ? '載入中...' : '請選擇面試官' }}
            </option>

            <option
              v-for="user in interviewerOptions"
              :key="user.id"
              :value="String(user.id)"
            >
              {{ user.name }}
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="interview-stage"
        label="面試階段"
        :error="errors.stage"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.stage"
            :class="fieldClass(invalid)"
            class="bg-white"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              請選擇
            </option>

            <option
              v-for="option in stageOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="interview-date"
        label="日期"
        :error="errors.date"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.date"
            type="date"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="interview-time"
        label="時間"
        :error="errors.time"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.time"
            type="time"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="interview-duration"
        label="時長（分鐘）"
        hint="15 至 480 分鐘"
        :error="errors.durationMinutes"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.durationMinutes"
            type="number"
            min="15"
            max="480"
            step="15"
            inputmode="numeric"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="interview-mode"
        label="面試方式"
        :error="errors.mode"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.mode"
            :class="fieldClass(invalid)"
            class="bg-white"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              請選擇
            </option>

            <option
              v-for="option in modeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="interview-meeting-link"
        label="會議連結"
        hint="視訊面試必填"
        :error="errors.meetingLink"
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.meetingLink"
            type="url"
            placeholder="https://"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="interview-location"
        label="地點"
        hint="現場面試必填"
        :error="errors.location"
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.location"
            type="text"
            placeholder="例如：台北辦公室 5F 會議室 A"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="interview-status"
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
        id="interview-notes"
        class="sm:col-span-2"
        label="備註"
        :error="errors.notes"
      >
        <template #default="{ id, describedBy, invalid }">
          <textarea
            :id="id"
            v-model="form.notes"
            rows="3"
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
