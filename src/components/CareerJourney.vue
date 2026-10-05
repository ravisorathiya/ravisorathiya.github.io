<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import { formatDuration, formatPeriod, monthsBetween, toYear } from '../utils/career'
import AppIcon from './AppIcon.vue'
import CountUp from './CountUp.vue'
import SkillBadge from './SkillBadge.vue'

const props = defineProps({
  experience: { type: Array, required: true },
  education: { type: Array, required: true },
  liveCount: { type: Number, default: 0 },
})

// Text derived from "now" is fine to pre-render (Vue fixes text on hydration),
// but bar positions are styles, so they're only applied after mount.
const now = new Date()
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const root = useTemplateRef('root')
const visible = useElementVisibility(root, { threshold: 0.2 })
const grown = computed(() => mounted.value && visible.value)

const WORK_COLORS = ['bg-brand-gradient', 'bg-linear-to-r from-teal-500 to-cyan-600']
const EDU_COLOR = 'bg-linear-to-r from-sky-500 to-indigo-500'

const work = computed(() =>
  props.experience.map((e, i) => {
    const months = monthsBetween(e.start, e.end ?? now)
    return {
      ...e,
      id: `work-${i}`,
      label: e.company,
      current: !e.end,
      period: formatPeriod(e),
      duration: formatDuration(months),
      months,
      color: WORK_COLORS[i % WORK_COLORS.length],
    }
  }),
)
const edu = computed(() =>
  props.education.map((e, i) => ({
    ...e,
    id: `edu-${i}`,
    label: e.short,
    period: `${e.start} — ${e.end ?? 'Present'}`,
    color: EDU_COLOR,
  })),
)
const lanes = computed(() => [
  { name: 'Work', icon: 'briefcase', items: work.value },
  { name: 'Study', icon: 'cap', items: edu.value },
])
const years = computed(() => Math.floor(work.value.reduce((n, w) => n + w.months, 0) / 12))

// Timeline axis: from the first January on record to just past today.
const nowYear = toYear(now)
const axisStart = Math.floor(Math.min(...[...props.experience, ...props.education].map((e) => toYear(e.start))))
const axisEnd = nowYear + 0.35
const pos = (y) => ((y - axisStart) / (axisEnd - axisStart)) * 100
// A month-precise end ('2025-03') covers that whole month.
const endYear = (d) => (d ? toYear(d) + (String(d).includes('-') ? 1 / 12 : 0) : nowYear)
const ticks = Array.from({ length: Math.floor(nowYear) - axisStart + 1 }, (_, i) => axisStart + i)

const segStyle = (item, i) => {
  if (!mounted.value) return { left: '0%', width: '0%', opacity: 0 }
  const left = pos(toYear(item.start))
  const width = pos(endYear(item.end)) - left
  // Only the grow-in is slow and staggered; hover feedback stays snappy.
  return {
    left: `${left}%`,
    width: grown.value ? `${width}%` : '0%',
    transitionDuration: '1100ms, 250ms, 250ms, 250ms',
    transitionDelay: `${150 + i * 220}ms, 0ms, 0ms, 0ms`,
  }
}

const active = ref(null)
const activeItem = computed(() => [...work.value, ...edu.value].find((x) => x.id === active.value))
const tooltipLeft = computed(() => {
  const it = activeItem.value
  if (!it) return 50
  const mid = (pos(toYear(it.start)) + pos(endYear(it.end))) / 2
  return Math.min(88, Math.max(12, mid))
})

function focusCard(id) {
  active.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
</script>

<template>
  <div ref="root">
    <!-- Headline numbers -->
    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-reveal class="card p-4">
        <dt class="text-xs text-slate-500">Years building Android</dt>
        <dd class="text-gradient mt-1 text-3xl font-bold"><CountUp :value="years" suffix="+" /></dd>
      </div>
      <div v-reveal="80" class="card p-4">
        <dt class="text-xs text-slate-500">Companies</dt>
        <dd class="text-gradient mt-1 text-3xl font-bold"><CountUp :value="experience.length" /></dd>
      </div>
      <div v-reveal="160" class="card p-4">
        <dt class="text-xs text-slate-500">Apps live on Google Play</dt>
        <dd class="text-gradient mt-1 text-3xl font-bold"><CountUp :value="liveCount" /></dd>
      </div>
      <div v-reveal="240" class="card p-4">
        <dt class="text-xs text-slate-500">Highest degree</dt>
        <dd class="text-gradient mt-1 text-3xl font-bold">{{ education[0]?.short }}</dd>
      </div>
    </dl>

    <!-- Interactive timeline -->
    <div v-reveal class="card mt-6 p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div class="flex flex-wrap items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="bg-brand-gradient size-2.5 rounded-full" /> Current role</span>
          <span class="flex items-center gap-1.5"><span :class="WORK_COLORS[1]" class="size-2.5 rounded-full" /> Previous role</span>
          <span class="flex items-center gap-1.5"><span :class="EDU_COLOR" class="size-2.5 rounded-full" /> Education</span>
        </div>
        <span class="font-mono">hover or tap a bar</span>
      </div>

      <div class="relative mt-10 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
        <!-- Tooltip for the hovered bar -->
        <Transition name="tip">
          <div
            v-if="activeItem && mounted"
            class="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1 text-xs whitespace-nowrap text-white shadow-lg transition-[left] duration-300 dark:bg-white dark:text-slate-900"
            :style="{ left: `calc(3.5rem + (100% - 3.5rem) * ${tooltipLeft / 100})` }"
          >
            <span class="font-semibold">{{ activeItem.label }}</span>
            · {{ activeItem.duration ?? activeItem.period }}
          </div>
        </Transition>

        <template v-for="lane in lanes" :key="lane.name">
          <span class="flex w-11 items-center gap-1 text-xs font-medium text-slate-500">
            <AppIcon :name="lane.icon" class="size-3.5 shrink-0" />{{ lane.name }}
          </span>
          <div class="relative h-10 rounded-lg bg-slate-100 dark:bg-slate-800/60">
            <button
              v-for="(it, i) in lane.items"
              :key="it.id"
              type="button"
              :class="[
                it.color,
                active === it.id ? 'scale-y-110 shadow-lg ring-2 ring-white dark:ring-slate-950' : active ? 'opacity-50' : '',
              ]"
              :style="segStyle(it, i + (lane.name === 'Study' ? 0 : 1))"
              class="absolute inset-y-1 flex items-center overflow-hidden rounded-md text-left transition-[width,opacity,scale,box-shadow] ease-out focus:outline-none motion-reduce:transition-none"
              :aria-label="`${it.label}: ${it.period}`"
              @mouseenter="active = it.id"
              @mouseleave="active = null"
              @focus="active = it.id"
              @blur="active = null"
              @click="focusCard(it.id)"
            >
              <span class="truncate px-2 text-xs font-semibold text-white">{{ it.label }}</span>
            </button>
          </div>
        </template>

        <!-- Year ticks + "now" marker -->
        <span />
        <div class="relative h-5">
          <template v-if="mounted">
            <span
              v-for="(y, i) in ticks"
              :key="y"
              class="absolute top-1 -translate-x-1/2 font-mono text-[10px] text-slate-400"
              :class="{ 'hidden sm:block': i % 2 }"
              :style="{ left: `${pos(y)}%` }"
            >{{ y }}</span>
          </template>
        </div>
        <div
          v-if="mounted"
          class="pointer-events-none absolute top-0 bottom-5 w-px bg-brand-500/60 transition-opacity delay-1000 duration-500"
          :class="grown ? 'opacity-100' : 'opacity-0'"
          :style="{ left: `calc(3.5rem + (100% - 3.5rem) * ${pos(nowYear) / 100})` }"
        >
          <span class="absolute -top-1 -left-[3px] flex size-[7px]">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span class="relative inline-flex size-[7px] rounded-full bg-brand-500" />
          </span>
          <span class="absolute -top-5 -translate-x-1/2 font-mono text-[10px] font-semibold text-brand-600 dark:text-brand-400">now</span>
        </div>
      </div>
    </div>

    <!-- Detail cards -->
    <div class="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <section>
        <h3 class="mb-4 flex items-center gap-2 font-mono text-sm text-slate-500">
          <AppIcon name="briefcase" class="size-4" /> experience
        </h3>
        <ol class="relative space-y-4 border-l border-slate-200 pl-6 dark:border-slate-800">
          <li
            v-for="(w, i) in work"
            :id="w.id"
            :key="w.id"
            v-reveal="i * 120"
            class="relative scroll-mt-28"
            @mouseenter="active = w.id"
            @mouseleave="active = null"
          >
            <span
              class="absolute top-6 -left-[31px] size-3 rounded-full ring-4 ring-white dark:ring-slate-950"
              :class="w.color"
            />
            <article
              class="card relative overflow-hidden p-5 transition duration-300"
              :class="active === w.id ? '-translate-y-0.5 border-brand-400 shadow-xl shadow-brand-500/10 dark:border-brand-500/60' : ''"
            >
              <span class="absolute inset-y-0 left-0 w-1" :class="w.color" />
              <div class="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500">
                <span>{{ w.period }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{{ w.duration }}</span>
                <span
                  v-if="w.current"
                  class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 font-sans font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                >
                  <span class="relative flex size-2">
                    <span class="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span class="relative inline-flex size-2 rounded-full bg-brand-500" />
                  </span>
                  Current
                </span>
              </div>
              <h4 class="mt-2 text-lg font-semibold">{{ w.role }}</h4>
              <p class="text-sm font-medium text-brand-600 dark:text-brand-400">{{ w.company }}</p>
              <p class="mt-2 text-slate-600 dark:text-slate-400">{{ w.description }}</p>
              <div v-if="w.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
                <SkillBadge v-for="t in w.tags" :key="t" :label="t" />
              </div>
            </article>
          </li>
        </ol>
      </section>

      <section>
        <h3 class="mb-4 flex items-center gap-2 font-mono text-sm text-slate-500">
          <AppIcon name="cap" class="size-4" /> education
        </h3>
        <ol class="space-y-4">
          <li
            v-for="(e, i) in edu"
            :id="e.id"
            :key="e.id"
            v-reveal="i * 120"
            class="scroll-mt-28"
            @mouseenter="active = e.id"
            @mouseleave="active = null"
          >
            <article
              class="card group relative flex items-center gap-4 overflow-hidden p-5 transition duration-300"
              :class="active === e.id ? '-translate-y-0.5 border-sky-400 shadow-xl shadow-sky-500/10 dark:border-sky-500/60' : ''"
            >
              <span
                class="grid size-14 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold text-white shadow-md transition group-hover:rotate-[-4deg]"
                :class="e.color"
              >{{ e.short }}</span>
              <div class="min-w-0">
                <p class="font-mono text-xs text-slate-500">{{ e.period }}</p>
                <h4 class="font-semibold">{{ e.degree }}</h4>
                <p v-if="e.school" class="text-sm text-slate-500">{{ e.school }}</p>
              </div>
            </article>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tip-enter-active,
.tip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tip-enter-from,
.tip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
