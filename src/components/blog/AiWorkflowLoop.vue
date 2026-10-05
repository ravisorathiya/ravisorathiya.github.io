<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The loop every AI session follows in my Android projects (blog: ai-workflow-android-developer).
const steps = [
  {
    key: 'map',
    label: 'Read the map',
    file: 'CLAUDE.md',
    who: 'Agent',
    text: 'Module map, build commands, DI pattern and the known traps (like "the vendored pdf.mjs is not upstream pdf.js"). The agent starts from the project\'s own rules, not from generic Android advice.',
  },
  {
    key: 'memory',
    label: 'Load the memory',
    file: 'ai/workflow/v_1_0/overview.md',
    who: 'Agent',
    text: 'The current version\'s overview: the open phase, the open bugs, anything still marked VERIFY ON DEVICE. Then the plans/ entry for the feature being touched, read in full.',
  },
  {
    key: 'plan',
    label: 'Plan & ask',
    file: 'ai/plans/<feature>.md',
    who: 'Agent + me',
    text: 'The agent writes or updates a plan. Anything a screenshot or video can\'t answer gets tagged ASK DEV, and I decide it. Behaviour is never guessed.',
  },
  {
    key: 'build',
    label: 'Build small',
    file: 'presentation/…',
    who: 'Agent',
    text: 'Smallest sensible change, reuse before writing new, and compile only the affected module (e.g. :presentation:pdf:compileDebugKotlin) for fast iteration.',
  },
  {
    key: 'verify',
    label: 'Verify on device',
    file: 'adb logcat · WebView CDP',
    who: 'Me + agent',
    text: 'Install, run, read logcat, or drive the live WebView over the DevTools protocol. Compiling is not verification. Nothing gets checked off until it actually ran.',
  },
  {
    key: 'write',
    label: 'Write it back',
    file: 'phase_<n>.md · plans/',
    who: 'Agent',
    text: 'Tick the bug line, update the plan, update the phase row. The next session (or a different agent) continues cold from here instead of re-discovering everything.',
  },
]

const active = ref(0)
const playing = ref(false)
let timer

const current = computed(() => steps[active.value])

function stop() {
  playing.value = false
  clearInterval(timer)
}
function play() {
  stop()
  playing.value = true
  timer = setInterval(() => (active.value = (active.value + 1) % steps.length), 3200)
}
function pick(i) {
  stop()
  active.value = i
}

// Auto-play only on the client, and only for people who don't prefer reduced motion.
onMounted(() => {
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) play()
})
onBeforeUnmount(stop)
</script>

<template>
  <figure class="not-prose card my-8 p-5 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <figcaption class="text-sm font-semibold text-slate-900 dark:text-white">One AI session, start to finish</figcaption>
      <button
        type="button"
        class="rounded-full border border-slate-200 px-3 py-1 font-mono text-xs text-slate-500 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:hover:text-brand-400"
        @click="playing ? stop() : play()"
      >
        {{ playing ? '❚❚ pause' : '▶ play' }}
      </button>
    </div>

    <ol class="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
      <li v-for="(s, i) in steps" :key="s.key">
        <button
          type="button"
          :aria-current="i === active ? 'step' : undefined"
          class="group flex w-full flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors"
          :class="i === active ? 'bg-brand-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'"
          @click="pick(i)"
        >
          <span
            class="grid size-9 place-items-center rounded-full text-sm font-bold transition-all duration-300"
            :class="
              i === active
                ? 'bg-brand-gradient scale-110 text-white shadow-lg shadow-brand-500/30'
                : i < active
                  ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
            "
            >{{ i + 1 }}</span
          >
          <span class="text-xs leading-tight font-medium" :class="i === active ? 'text-slate-900 dark:text-white' : 'text-slate-500'">{{ s.label }}</span>
        </button>
      </li>
    </ol>

    <!-- progress rail -->
    <div class="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div class="bg-brand-gradient h-full rounded-full transition-[width] duration-500" :style="{ width: `${((active + 1) / steps.length) * 100}%` }" />
    </div>

    <Transition name="fade" mode="out-in">
      <div :key="current.key" class="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <code class="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">{{ current.file }}</code>
          <span class="rounded-full border border-slate-200 px-2 py-0.5 text-slate-500 dark:border-slate-700">{{ current.who }}</span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ current.text }}</p>
      </div>
    </Transition>
    <p class="mt-3 text-center font-mono text-[11px] text-slate-400">step 6 feeds step 2 of the next session ↺</p>
  </figure>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
