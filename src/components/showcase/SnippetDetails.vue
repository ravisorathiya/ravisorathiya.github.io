<script setup>
// The "why" + "used in" block of the active showcase tab.
import { computed } from 'vue'
import { getProject } from '../../data/portfolio'

const props = defineProps({ snippet: { type: Object, required: true } })
const apps = computed(() => props.snippet.relatedProjects.map(getProject).filter(Boolean))
</script>

<template>
  <div>
    <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ snippet.caption }}</p>
    <div class="mt-3 flex flex-wrap items-center gap-1.5">
      <span class="w-full font-mono text-[11px] text-slate-500">used in</span>
      <RouterLink
        v-for="p in apps"
        :key="p.slug"
        :to="`/projects/${p.slug}`"
        :title="p.title"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 py-0.5 pr-2.5 pl-0.5 text-xs text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-brand-400"
      >
        <img v-if="p.icon" :src="p.icon" alt="" class="size-5 rounded-full" loading="lazy" />
        {{ p.title.split(' - ')[0] }}
      </RouterLink>
    </div>
  </div>
</template>
