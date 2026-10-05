<script setup>
import { computed, reactive } from 'vue'

// Shows why "it compiles" never ticks a bug line in my ai/ workflow (blog: ai-workflow-android-developer).
const done = reactive({ fix: false, compile: false, device: false })

const steps = [
  { key: 'fix', label: 'Agent writes the fix', needs: null },
  { key: 'compile', label: 'Module compiles', needs: 'fix' },
  { key: 'device', label: 'Ran on a real device', needs: 'compile' },
]

function toggle(s) {
  if (s.needs && !done[s.needs]) return
  done[s.key] = !done[s.key]
  // Unchecking a step undoes everything after it.
  if (!done[s.key]) steps.slice(steps.indexOf(s) + 1).forEach((n) => (done[n.key] = false))
}

const status = computed(() => {
  if (done.device) return { mark: '[x]', tone: 'emerald', note: 'Fixed: what changed (`File.kt`).' }
  if (done.fix) return { mark: '[~]', tone: 'amber', note: 'Fix written. VERIFY ON DEVICE' }
  return { mark: '[ ]', tone: 'slate', note: '' }
})
const tones = {
  slate: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
}
</script>

<template>
  <figure class="not-prose card my-8 p-5 sm:p-6">
    <figcaption class="text-sm font-semibold text-slate-900 dark:text-white">
      When does a bug get ticked? <span class="font-normal text-slate-500">Try it.</span>
    </figcaption>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row">
      <button
        v-for="s in steps"
        :key="s.key"
        type="button"
        :disabled="!!s.needs && !done[s.needs]"
        class="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
        :class="done[s.key] ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white' : 'border-slate-200 text-slate-600 hover:border-brand-500 dark:border-slate-700 dark:text-slate-400'"
        @click="toggle(s)"
      >
        <span
          class="grid size-5 shrink-0 place-items-center rounded-md border text-[11px] font-bold"
          :class="done[s.key] ? 'bg-brand-gradient border-transparent text-white' : 'border-slate-300 dark:border-slate-600'"
          >{{ done[s.key] ? '✓' : '' }}</span
        >
        {{ s.label }}
      </button>
    </div>

    <div class="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-slate-300">
      <span class="text-slate-500"># phase_0.md → ## Bugs</span><br />
      * <span class="rounded px-1 font-bold transition-colors" :class="tones[status.tone]">{{ status.mark }}</span>
      <span class="text-white">**Splash – Back:**</span> back pressed while the splash loads closes the app.
      <Transition name="fade"><span v-if="status.note" :key="status.mark" :class="status.tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'"> {{ status.note }}</span></Transition>
    </div>

    <p class="mt-3 text-xs text-slate-500">
      <template v-if="done.compile && !done.device">A green build still leaves it at <code class="font-mono">[~]</code>. Compiling and reading code are not verification.</template>
      <template v-else-if="done.device">Only a real run turns it into <code class="font-mono">[x]</code>.</template>
      <template v-else>Status legend: <code class="font-mono">[ ]</code> todo · <code class="font-mono">[~]</code> in progress · <code class="font-mono">[x]</code> verified · <code class="font-mono">[-]</code> blocked / needs me</template>
    </p>
  </figure>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>
