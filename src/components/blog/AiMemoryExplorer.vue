<script setup>
import { computed, ref } from 'vue'

// The `:ai` module of my PDF app, and its "Which folder?" routing table (blog: ai-workflow-android-developer).
const tree = [
  { path: 'README.md', depth: 0, about: 'The rules for agents: hard rules, folder map, status legend, and "source of truth" order. Every session reads it first.' },
  { path: 'workflow/', depth: 0, dir: true, about: 'Answers WHEN: the app\'s timeline, one folder per versionName.' },
  { path: 'workflow/v_1_0/', depth: 1, dir: true, about: 'versionName "1.0": the initial build, hardened through QA phases.' },
  { path: 'workflow/v_1_0/overview.md', depth: 2, about: 'Entry point for the version: goal, status, phase table, open items to carry over.' },
  { path: 'workflow/v_1_0/phase_0.md', depth: 2, about: 'Reserved for common bugs that aren\'t tied to a phase.' },
  { path: 'workflow/v_1_0/phase_1.md', depth: 2, about: 'One batch of work + its QA pass: "## Changes" (links to plans/) and "## Bugs" (a checklist).' },
  { path: 'workflow/v_1_1/', depth: 1, dir: true, about: 'The next version. Opened only when I say 1.1 work starts; unresolved items get carried over.' },
  { path: 'plans/', depth: 0, dir: true, about: 'Answers WHAT and HOW: one file per feature, fix or migration, with plan, living notes and status.' },
  { path: 'plans/signature.md', depth: 1, about: 'Standing design notes for a fragile feature, so nobody re-learns its traps.' },
  { path: 'plans/1_migration_classic_admob_to_nextgen_sdk.md', depth: 1, about: 'A library migration, tracked across many sessions.' },
  { path: 'plans/<new_feature>.md', depth: 1, about: 'Where a new screenshot-driven feature gets analysed first (with ASK DEV questions).' },
  { path: 'events/event.md', depth: 0, about: 'Every analytics event, ordered the way a user moves through the app.' },
  { path: 'assets/', depth: 0, dir: true, about: 'Annotated screenshots and reference videos, always linked from the entry they belong to.' },
]

const tasks = [
  { q: '"The search screen crashes on back"', to: ['workflow/v_1_0/phase_1.md'], why: 'A bug goes into the open phase\'s ## Bugs checklist. If it needs real investigation, it also gets a plans/ entry linked from the bug line.' },
  { q: '"Something is broken everywhere, not in one phase"', to: ['workflow/v_1_0/phase_0.md'], why: 'phase_0.md is reserved for common bugs that aren\'t tied to a phase.' },
  { q: '"Migrate to the next-gen ads SDK"', to: ['plans/1_migration_classic_admob_to_nextgen_sdk.md', 'workflow/v_1_0/overview.md'], why: 'Library swaps and architecture changes get their own plans/ file, listed in the version\'s overview.md.' },
  { q: '"Build this to match the screenshot"', to: ['plans/<new_feature>.md', 'assets/'], why: 'Analyse first, flag what the image can\'t answer as ASK DEV, get it decided, then plan and build. The media goes to assets/.' },
  { q: '"Which event fires when a file opens?"', to: ['events/event.md'], why: 'Analytics lookups and wiring always go through the event reference.' },
]

const selectedTask = ref(null)
const selectedPath = ref('README.md')

const highlighted = computed(() => (selectedTask.value === null ? [selectedPath.value] : tasks[selectedTask.value].to))
const info = computed(() => tree.find((n) => n.path === selectedPath.value))

function pickTask(i) {
  selectedTask.value = selectedTask.value === i ? null : i
  if (selectedTask.value !== null) selectedPath.value = tasks[i].to[0]
}
function pickNode(p) {
  selectedTask.value = null
  selectedPath.value = p
}
const name = (p) => p.replace(/\/$/, '').split('/').pop() + (p.endsWith('/') ? '/' : '')
</script>

<template>
  <figure class="not-prose card my-8 overflow-hidden">
    <figcaption class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
      Explore the <code class="font-mono text-brand-600 dark:text-brand-400">:ai</code> module
      <span class="ml-1 font-normal text-slate-500">· tap a file, or ask "where does this go?"</span>
    </figcaption>

    <div class="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <!-- file tree -->
      <ul class="border-slate-200 bg-slate-50 p-3 font-mono text-[13px] md:border-r dark:border-slate-800 dark:bg-slate-900/60">
        <li class="px-2 py-1 text-slate-400">ai/src/main/java/ai/</li>
        <li v-for="n in tree" :key="n.path">
          <button
            type="button"
            class="flex w-full items-center gap-1.5 truncate rounded-md py-1 pr-2 text-left transition-colors"
            :style="{ paddingLeft: `${0.75 + n.depth * 1}rem` }"
            :class="
              highlighted.includes(n.path)
                ? 'bg-brand-500/15 font-semibold text-brand-700 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800'
            "
            @click="pickNode(n.path)"
          >
            <span aria-hidden="true">{{ n.dir ? '▸' : '·' }}</span>
            <span class="truncate">{{ name(n.path) }}</span>
          </button>
        </li>
      </ul>

      <!-- explanation + router -->
      <div class="p-5">
        <div v-if="selectedTask === null && info" class="min-h-24">
          <code class="font-mono text-xs text-slate-500">{{ info.path }}</code>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ info.about }}</p>
        </div>
        <div v-else-if="selectedTask !== null" class="min-h-24">
          <p class="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Goes in</p>
          <p class="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300">{{ tasks[selectedTask].to.join(' + ') }}</p>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ tasks[selectedTask].why }}</p>
        </div>

        <p class="mt-5 text-xs font-semibold text-slate-900 dark:text-white">Where does this note go?</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="(t, i) in tasks"
            :key="t.q"
            type="button"
            class="rounded-full border px-3 py-1 text-left text-xs transition-colors"
            :class="
              selectedTask === i
                ? 'bg-brand-gradient border-transparent text-white'
                : 'border-slate-200 text-slate-600 hover:border-brand-500 dark:border-slate-700 dark:text-slate-400'
            "
            @click="pickTask(i)"
          >
            {{ t.q }}
          </button>
        </div>
      </div>
    </div>
  </figure>
</template>
