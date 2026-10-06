<script setup>
import { computed, ref } from 'vue'
import { projects } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'

// Skill ⇄ app map (blog: find-ravi-sorathiya-android-developer).
// Built from each project's real `tags`: pick a skill to light up the apps that use it,
// or hover an app to light up its skills.
const counts = {}
for (const p of projects) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1
const skills = Object.entries(counts)
  .filter(([, n]) => n >= 2)
  .sort((a, b) => b[1] - a[1])
  .map(([name, n]) => ({ name, n }))

const skill = ref('Jetpack Compose')
const hovered = ref(null)

const uses = (p) => p.tags.includes(skill.value)
const matching = computed(() => projects.filter(uses))
const lit = (p) => (hovered.value ? hovered.value === p : uses(p))
const skillLit = (s) => (hovered.value ? hovered.value.tags.includes(s.name) : s.name === skill.value)
</script>

<template>
  <figure class="not-prose card my-12 overflow-hidden">
    <div class="p-5 sm:p-6">
      <figcaption>
        <p class="font-mono text-xs text-brand-600 dark:text-brand-400">// skill map</p>
        <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Which apps use what?</p>
        <p class="mt-1 text-sm text-slate-500">Tap a skill to light up the apps built with it. Hover an app to see its stack.</p>
      </figcaption>

      <div class="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Skills">
        <button
          v-for="s in skills"
          :key="s.name"
          type="button"
          :aria-pressed="skill === s.name"
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition duration-200"
          :class="skillLit(s)
            ? 'scale-105 border-brand-500 bg-brand-gradient text-white shadow-md shadow-brand-500/25'
            : hovered
              ? 'border-slate-200 text-slate-400 opacity-50 dark:border-slate-800'
              : 'border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-brand-300'"
          @click="skill = s.name"
        >
          {{ s.name }}
          <span class="rounded-full px-1.5 text-[10px]" :class="skillLit(s) ? 'bg-white/25' : 'bg-slate-100 dark:bg-slate-800'">{{ s.n }}</span>
        </button>
      </div>
    </div>

    <div class="border-t border-slate-200 bg-slate-50/60 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
      <ul class="grid grid-cols-5 gap-3 sm:grid-cols-7" @mouseleave="hovered = null">
        <li v-for="p in projects" :key="p.slug">
          <RouterLink
            :to="`/projects/${p.slug}`"
            :title="p.title"
            class="group block text-center"
            @mouseenter="hovered = p"
            @focus="hovered = p"
            @blur="hovered = null"
          >
            <span class="relative mx-auto block size-12 sm:size-14">
              <img
                :src="p.icon"
                :alt="p.title"
                width="56"
                height="56"
                loading="lazy"
                class="size-full rounded-2xl transition duration-300"
                :class="lit(p) ? 'scale-105 shadow-lg shadow-brand-500/20' : 'scale-90 opacity-25 grayscale'"
              />
              <span v-if="lit(p) && !hovered" class="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-brand-500 text-white ring-2 ring-white dark:ring-slate-900">
                <AppIcon name="check" class="size-2.5" />
              </span>
            </span>
            <span class="mt-1 block truncate text-[10px] transition" :class="lit(p) ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'">{{ p.title }}</span>
          </RouterLink>
        </li>
      </ul>

      <div class="mt-5 min-h-12" aria-live="polite">
        <template v-if="hovered">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ hovered.title }}</p>
          <p class="text-xs text-slate-500">{{ hovered.tags.join(' · ') }}</p>
        </template>
        <template v-else>
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span class="font-semibold text-slate-900 dark:text-white">{{ skill }}</span>
            <span class="text-slate-500">in {{ matching.length }} of {{ projects.length }} apps</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-full rounded-full bg-brand-gradient transition-[width] duration-500" :style="{ width: `${(matching.length / projects.length) * 100}%` }" />
          </div>
        </template>
      </div>
    </div>
  </figure>
</template>
