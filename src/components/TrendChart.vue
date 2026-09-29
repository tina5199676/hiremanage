<script setup lang="ts">
import { computed, ref } from 'vue'

import { formatDate } from '../utils/formatters'

import type { TrendPoint } from '../types/dashboard'

const props = defineProps<{
  points: TrendPoint[]
  title: string
}>()

const WIDTH = 640
const HEIGHT = 180
const PADDING = { top: 16, right: 8, bottom: 28, left: 28 }

const plotWidth = WIDTH - PADDING.left - PADDING.right
const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

const maxCount = computed(() =>
  Math.max(1, ...props.points.map((point) => point.count)),
)

const total = computed(() =>
  props.points.reduce((sum, point) => sum + point.count, 0),
)

const bars = computed(() => {
  const count = props.points.length

  if (count === 0) {
    return []
  }

  const slot = plotWidth / count
  const barWidth = Math.max(2, Math.min(12, slot - 2))

  return props.points.map((point, index) => {
    const height = (point.count / maxCount.value) * plotHeight

    return {
      ...point,
      x: PADDING.left + index * slot + (slot - barWidth) / 2,
      y: PADDING.top + plotHeight - height,
      width: barWidth,
      height,
      isMax: point.count === maxCount.value && point.count > 0,
    }
  })
})

const gridLines = computed(() => {
  const steps = Math.min(maxCount.value, 4)
  const lines: Array<{ y: number; value: number }> = []

  for (let step = 0; step <= steps; step += 1) {
    const value = Math.round((maxCount.value / steps) * step)

    lines.push({
      y: PADDING.top + plotHeight - (value / maxCount.value) * plotHeight,
      value,
    })
  }

  return lines
})

const axisLabels = computed(() => {
  if (bars.value.length === 0) {
    return []
  }

  const first = bars.value[0]
  const middle = bars.value[Math.floor(bars.value.length / 2)]
  const last = bars.value[bars.value.length - 1]

  return [first, middle, last].map((bar) => ({
    x: bar.x + bar.width / 2,
    label: bar.date.slice(5),
  }))
})

const hovered = ref<number | null>(null)

const showTable = ref(false)
</script>

<template>
  <figure>
    <div class="flex items-center justify-between gap-3">
      <figcaption class="text-sm font-semibold text-slate-900">
        {{ title }}
      </figcaption>

      <button
        type="button"
        class="rounded px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-pressed="showTable"
        @click="showTable = !showTable"
      >
        {{ showTable ? '顯示圖表' : '顯示表格' }}
      </button>
    </div>

    <p class="mt-1 text-xs text-slate-500">
      最近 30 天共 {{ total }} 筆應徵
    </p>

    <div
      v-if="showTable"
      class="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200"
    >
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th
              scope="col"
              class="px-3 py-2 text-left text-xs font-semibold text-slate-500"
            >
              日期
            </th>

            <th
              scope="col"
              class="px-3 py-2 text-right text-xs font-semibold text-slate-500"
            >
              應徵數
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="point in points"
            :key="point.date"
          >
            <td class="px-3 py-1.5 text-slate-700">
              {{ formatDate(point.date) }}
            </td>

            <td class="px-3 py-1.5 text-right tabular-nums text-slate-700">
              {{ point.count }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <svg
      v-else
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="mt-3 h-auto w-full"
      role="img"
      :aria-label="`${title}，最近 30 天共 ${total} 筆應徵，單日最多 ${maxCount} 筆`"
    >
      <g
        v-for="line in gridLines"
        :key="line.value"
      >
        <line
          :x1="PADDING.left"
          :x2="WIDTH - PADDING.right"
          :y1="line.y"
          :y2="line.y"
          class="stroke-slate-200"
          stroke-width="1"
        />

        <text
          :x="PADDING.left - 6"
          :y="line.y + 4"
          text-anchor="end"
          class="fill-slate-500 text-[10px]"
        >
          {{ line.value }}
        </text>
      </g>

      <g
        v-for="(bar, index) in bars"
        :key="bar.date"
        @mouseenter="hovered = index"
        @mouseleave="hovered = null"
      >
        <rect
          :x="bar.x - 2"
          :y="PADDING.top"
          :width="bar.width + 4"
          :height="plotHeight"
          fill="transparent"
        />

        <rect
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          rx="2"
          :class="hovered === index ? 'fill-blue-700' : 'fill-blue-600'"
        >
          <title>{{ formatDate(bar.date) }}：{{ bar.count }} 筆</title>
        </rect>

        <text
          v-if="bar.isMax || hovered === index"
          :x="bar.x + bar.width / 2"
          :y="bar.y - 4"
          text-anchor="middle"
          class="fill-slate-700 text-[10px] font-medium"
        >
          {{ bar.count }}
        </text>
      </g>

      <line
        :x1="PADDING.left"
        :x2="WIDTH - PADDING.right"
        :y1="PADDING.top + plotHeight"
        :y2="PADDING.top + plotHeight"
        class="stroke-slate-300"
        stroke-width="1"
      />

      <text
        v-for="label in axisLabels"
        :key="label.label"
        :x="label.x"
        :y="HEIGHT - 8"
        text-anchor="middle"
        class="fill-slate-500 text-[10px]"
      >
        {{ label.label }}
      </text>
    </svg>
  </figure>
</template>
