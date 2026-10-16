<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import AppAlert from './AppAlert.vue'
import FormField from './FormField.vue'
import { validateFeedbackForm } from '../utils/validators'

import type { InterviewFeedback, SubmitFeedbackInput } from '../types/interview'
import type {
  FeedbackFormErrors,
  FeedbackFormInput,
} from '../utils/validators'

const props = withDefaults(
  defineProps<{
    initial?: InterviewFeedback | null
    submitting?: boolean
    submitError?: string | null
  }>(),
  {
    initial: null,
    submitting: false,
    submitError: null,
  },
)

const emit = defineEmits<{
  submit: [payload: SubmitFeedbackInput]
  cancel: []
}>()

const SCORES = [1, 2, 3, 4, 5]

const form = reactive<FeedbackFormInput>({
  score: '',
  feedback: '',
  notes: '',
})

const errors = ref<FeedbackFormErrors>({})

watch(
  () => props.initial,
  (feedback) => {
    if (feedback) {
      form.score = String(feedback.score)
      form.feedback = feedback.feedback
      form.notes = feedback.notes
    }
  },
  { immediate: true },
)

function handleSubmit() {
  errors.value = validateFeedbackForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    score: Number(form.score),
    feedback: form.feedback.trim(),
    notes: form.notes.trim(),
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
    novalidate
    @submit.prevent="handleSubmit"
  >
    <AppAlert
      v-if="submitError"
      class="mb-5"
      :message="submitError"
    />

    <fieldset class="mb-5">
      <legend class="mb-2 block text-sm font-medium text-slate-700">
        評分
        <span
          aria-hidden="true"
          class="text-red-600"
        >
          *
        </span>
      </legend>

      <div
        class="flex flex-wrap gap-2"
        :aria-describedby="errors.score ? 'feedback-score-error' : undefined"
      >
        <label
          v-for="score in SCORES"
          :key="score"
          class="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition focus-within:ring-2 focus-within:ring-blue-500"
          :class="
            form.score === String(score)
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          "
        >
          <input
            v-model="form.score"
            type="radio"
            name="feedback-score"
            :value="String(score)"
            class="sr-only"
          />
          {{ score }} 分
        </label>
      </div>

      <p
        v-if="errors.score"
        id="feedback-score-error"
        role="alert"
        class="mt-1 text-xs text-red-600"
      >
        {{ errors.score }}
      </p>
    </fieldset>

    <div class="grid gap-5">
      <FormField
        id="feedback-content"
        label="面試回饋"
        :error="errors.feedback"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <textarea
            :id="id"
            v-model="form.feedback"
            rows="4"
            placeholder="請描述候選人的表現、優勢與需要確認的地方"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="feedback-notes"
        label="內部備註"
        hint="僅供招聘團隊參考"
        :error="errors.notes"
      >
        <template #default="{ id, describedBy, invalid }">
          <textarea
            :id="id"
            v-model="form.notes"
            rows="2"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>
    </div>

    <div class="mt-5 flex justify-end gap-2">
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
        {{ submitting ? '送出中...' : '送出回饋' }}
      </button>
    </div>
  </form>
</template>
