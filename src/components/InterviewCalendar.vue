<script setup lang="ts">
import { computed } from 'vue'

import { buildCalendarGrid, toDateKey } from '../utils/dates'
import { INTERVIEW_STAGE_LABELS } from '../utils/labels'

import type { Interview, InterviewStatus } from '../types/interview'

const props = defineProps<{
  year: number
  month: number
  interviews: Interview[]
}>()

const emit = defineEmits<{
  select: [interview: Interview]
}>()

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const todayKey = toDateKey(new Date())

const weeks = computed(() => buildCalendarGrid(props.year, props.month))

const interviewsByDate = computed(() => {
  const map = new Map<string, Interview[]>()

  props.interviews.forEach((interview) => {
    const list = map.get(interview.date) ?? []

    list.push(interview)
    map.set(interview.date, list)
  })

  map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))

  return map
})

const statusClasses: Record<InterviewStatus, string> = {
  scheduled: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500 line-through',
}

function itemsFor(key: string): Interview[] {
  return interviewsByDate.value.get(key) ?? []
}
</script>

<template>
  <table class="w-full table-fixed border-collapse">
    <caption class="sr-only">
      {{ year }} 年 {{ month }} 月面試行事曆
    </caption>

    <thead>
      <tr>
        <th
          v-for="label in WEEKDAY_LABELS"
          :key="label"
          scope="col"
          class="border-b border-slate-200 py-2 text-center text-xs font-semibold text-slate-500"
        >
          {{ label }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
      >
        <td
          v-for="cell in week"
          :key="cell.key"
          class="h-28 border-b border-r border-slate-100 p-1 align-top last:border-r-0"
          :class="cell.inMonth ? 'bg-white' : 'bg-slate-50'"
        >
          <div class="flex items-center justify-between px-1">
            <span
              class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
              :class="[
                cell.inMonth ? 'text-slate-700' : 'text-slate-500',
                cell.key === todayKey ? 'bg-slate-900 font-semibold text-white' : '',
              ]"
            >
              {{ cell.day }}

              <span
                v-if="cell.key === todayKey"
                class="sr-only"
              >
                （今天）
              </span>
            </span>
          </div>

          <ul
            v-if="itemsFor(cell.key).length > 0"
            class="mt-1 space-y-1"
          >
            <li
              v-for="interview in itemsFor(cell.key)"
              :key="interview.id"
            >
              <button
                type="button"
                class="block w-full truncate rounded border px-1.5 py-1 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="statusClasses[interview.status]"
                :title="`${interview.time} ${interview.candidateName} - ${INTERVIEW_STAGE_LABELS[interview.stage]}`"
                @click="emit('select', interview)"
              >
                <span class="font-medium">{{ interview.time }}</span>
                {{ interview.candidateName }}

                <span class="sr-only">
                  ，{{ INTERVIEW_STAGE_LABELS[interview.stage] }}，查看詳細
                </span>
              </button>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>
