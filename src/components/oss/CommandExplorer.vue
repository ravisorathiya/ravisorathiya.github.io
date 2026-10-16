<script setup>
// Every kotlin-artisan command, grouped like `artisan list`. Group list on the left
// (underlined strip on phones), commands of the chosen group on the right.
import { ref } from 'vue'
import { artisan } from '../../data/oss'

const active = ref(0)
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
    <div role="tablist" aria-label="Command groups" class="no-scrollbar -mx-4 flex overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0 lg:flex-col lg:border-b-0 dark:border-slate-800">
      <button
        v-for="(g, i) in artisan.commandGroups"
        :key="g.group"
        role="tab"
        type="button"
        :aria-selected="i === active"
        class="-mb-px shrink-0 border-b-2 px-3 py-2.5 text-left whitespace-nowrap transition lg:mb-0 lg:border-b-0 lg:border-l-2 lg:px-5"
        :class="
          i === active
            ? 'border-brand-500 text-slate-900 dark:text-white'
            : 'border-transparent text-slate-500 hover:text-slate-900 lg:border-slate-200 dark:text-slate-400 dark:hover:text-white lg:dark:border-slate-800'
        "
        @click="active = i"
      >
        <span class="font-mono text-sm font-semibold">{{ g.group }}</span>
        <span class="hidden text-xs text-slate-500 lg:block">{{ g.blurb }}</span>
      </button>
    </div>

    <ul role="tabpanel" class="grid content-start gap-2 sm:grid-cols-2">
      <li
        v-for="c in artisan.commandGroups[active].commands"
        :key="c[0]"
        class="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-400/60 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <code class="font-mono text-sm font-semibold break-all text-brand-700 dark:text-brand-300">artisan {{ c[0] }}</code>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ c[1] }}</p>
      </li>
    </ul>
  </div>
</template>
