<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import AppAlert from './AppAlert.vue'
import FormField from './FormField.vue'
import {
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_STATUS_LABELS,
  toOptions,
} from '../utils/labels'
import { validateCandidateForm } from '../utils/validators'

import type {
  Candidate,
  CandidateSource,
  CandidateStatus,
  CreateCandidateInput,
} from '../types/candidate'
import type {
  CandidateFormErrors,
  CandidateFormInput,
} from '../utils/validators'

const props = withDefaults(
  defineProps<{
    initial?: Candidate | null
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
  submit: [payload: CreateCandidateInput]
  cancel: []
}>()

const sourceOptions = toOptions(CANDIDATE_SOURCE_LABELS)
const statusOptions = toOptions(CANDIDATE_STATUS_LABELS)

const form = reactive<CandidateFormInput>({
  name: '',
  email: '',
  phone: '',
  currentTitle: '',
  currentCompany: '',
  location: '',
  experience: '',
  education: '',
  skills: '',
  source: '',
  status: '',
})

const errors = ref<CandidateFormErrors>({})

watch(
  () => props.initial,
  (candidate) => {
    if (!candidate) {
      return
    }

    form.name = candidate.name
    form.email = candidate.email
    form.phone = candidate.phone
    form.currentTitle = candidate.currentTitle
    form.currentCompany = candidate.currentCompany
    form.location = candidate.location
    form.experience = candidate.experience
    form.education = candidate.education
    form.skills = candidate.skills.join(', ')
    form.source = candidate.source
    form.status = candidate.status
  },
  { immediate: true },
)

function handleSubmit() {
  errors.value = validateCandidateForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    currentTitle: form.currentTitle.trim(),
    currentCompany: form.currentCompany.trim(),
    location: form.location.trim(),
    experience: form.experience.trim(),
    education: form.education.trim(),
    skills: form.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0),
    source: form.source as CandidateSource,
    status: form.status as CandidateStatus,
    resume: props.initial?.resume,
  })
}

const inputClass =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2'

function fieldClass(invalid: boolean) {
  return invalid
    ? `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${inputClass} border-slate-300 focus:border-blue-500 focus:ring-blue-100`
}

type TextFieldKey = Exclude<keyof CandidateFormInput, 'source' | 'status'>

const textFields: Array<{
  key: TextFieldKey
  label: string
  type?: string
  autocomplete?: string
  placeholder?: string
  hint?: string
  wide?: boolean
}> = [
  { key: 'name', label: '姓名', autocomplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'phone', label: '電話', type: 'tel', autocomplete: 'tel' },
  { key: 'location', label: '所在地' },
  { key: 'currentTitle', label: '目前職稱' },
  { key: 'currentCompany', label: '目前公司' },
  { key: 'experience', label: '工作經驗', placeholder: '例如：3+ years' },
  { key: 'education', label: '學歷', placeholder: '例如：Bachelor' },
  {
    key: 'skills',
    label: '技能',
    hint: '以逗號分隔，例如：Vue 3, TypeScript',
    wide: true,
  },
]
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
        v-for="field in textFields"
        :id="`candidate-${field.key}`"
        :key="field.key"
        :class="field.wide ? 'sm:col-span-2' : ''"
        :label="field.label"
        :hint="field.hint"
        :error="errors[field.key]"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form[field.key]"
            :type="field.type ?? 'text'"
            :autocomplete="field.autocomplete"
            :placeholder="field.placeholder"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="candidate-source"
        label="來源"
        :error="errors.source"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <select
            :id="id"
            v-model="form.source"
            :class="fieldClass(invalid)"
            class="bg-white"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          >
            <option value="">
              請選擇
            </option>

            <option
              v-for="option in sourceOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
      </FormField>

      <FormField
        id="candidate-status"
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
