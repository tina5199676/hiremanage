<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import AppAlert from './AppAlert.vue'
import FormField from './FormField.vue'
import {
  APPLICATION_STATUS_LABELS,
  OFFER_STATUS_LABELS,
  toOptions,
} from '../utils/labels'
import { validateOfferForm } from '../utils/validators'

import type { Application } from '../types/application'
import type { CreateOfferInput, Offer, OfferStatus } from '../types/offer'
import type { OfferFormErrors, OfferFormInput } from '../utils/validators'

const props = withDefaults(
  defineProps<{
    initial?: Offer | null
    /** 建立時可由 query 預選應徵紀錄 */
    defaultApplicationId?: number | null
    applicationOptions?: Application[]
    optionsLoading?: boolean
    submitting?: boolean
    submitError?: string | null
    submitLabel?: string
  }>(),
  {
    initial: null,
    defaultApplicationId: null,
    applicationOptions: () => [],
    optionsLoading: false,
    submitting: false,
    submitError: null,
    submitLabel: '儲存',
  },
)

const emit = defineEmits<{
  submit: [payload: CreateOfferInput]
  cancel: []
}>()

/** 編輯時只允許在草稿 / 已送出之間切換，接受或拒絕需透過狀態操作 */
const statusOptions = toOptions(OFFER_STATUS_LABELS).filter(
  (option) => option.value === 'draft' || option.value === 'sent',
)

const form = reactive<OfferFormInput>({
  applicationId: props.defaultApplicationId
    ? String(props.defaultApplicationId)
    : '',
  salary: '',
  startDate: '',
  expirationDate: '',
  benefits: '',
  message: '',
  status: 'draft',
})

const errors = ref<OfferFormErrors>({})

function populate(offer: Offer | null) {
  if (!offer) {
    return
  }

  form.applicationId = String(offer.applicationId)
  form.salary = String(offer.salary)
  form.startDate = offer.startDate
  form.expirationDate = offer.expirationDate
  form.benefits = offer.benefits.join(', ')
  form.message = offer.message
  form.status = offer.status
}

watch(
  () => props.initial,
  (offer) => populate(offer),
  { immediate: true },
)

function handleSubmit() {
  errors.value = validateOfferForm(form)

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    applicationId: Number(form.applicationId),
    salary: Number(form.salary),
    startDate: form.startDate,
    expirationDate: form.expirationDate,
    benefits: form.benefits
      .split(',')
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0),
    message: form.message.trim(),
    status: form.status as OfferStatus,
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
        v-if="!initial"
        id="offer-application"
        class="sm:col-span-2"
        label="應徵紀錄"
        hint="候選人與職缺由應徵紀錄決定，建立後不可變更"
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

      <div
        v-else
        class="sm:col-span-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
      >
        <span class="font-medium text-slate-900">{{ initial.candidateName }}</span>
        ・ {{ initial.jobTitle }}
      </div>

      <FormField
        id="offer-salary"
        label="月薪"
        :error="errors.salary"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.salary"
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
        id="offer-status"
        label="狀態"
        hint="接受或拒絕請於 Offer 詳細頁操作"
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
        id="offer-start-date"
        label="到職日期"
        :error="errors.startDate"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.startDate"
            type="date"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="offer-expiration-date"
        label="Offer 有效期限"
        hint="候選人需在此日期前回覆，不能晚於到職日期"
        :error="errors.expirationDate"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.expirationDate"
            type="date"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="offer-benefits"
        class="sm:col-span-2"
        label="福利"
        hint="以逗號分隔，例如：勞健保, 年終獎金, 彈性上下班"
        :error="errors.benefits"
      >
        <template #default="{ id, describedBy, invalid }">
          <input
            :id="id"
            v-model="form.benefits"
            type="text"
            :class="fieldClass(invalid)"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
          />
        </template>
      </FormField>

      <FormField
        id="offer-message"
        class="sm:col-span-2"
        label="Offer 說明"
        :error="errors.message"
        required
      >
        <template #default="{ id, describedBy, invalid }">
          <textarea
            :id="id"
            v-model="form.message"
            rows="4"
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
