<script setup>
// Animated terminal that replays real kotlin-artisan output (src/data/artisan-demos.json):
// types the command, then reveals the output line by line, then moves to the next demo.
// Pre-renders the first demo's full output (SSR + no-JS + reduced motion); timers run only
// after mount, pause while off-screen, and stop for good once the visitor picks a tab.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntersectionObserver, usePreferredReducedMotion } from '@vueuse/core'
// Real output from v0.2.0 run on the Messages project (paths and device serial masked).
import allDemos from '../../data/artisan-demos.json'

const props = defineProps({
  // Subset of demo ids to show, in order (default: all).
  only: { type: Array, default: null },
  compact: { type: Boolean, default: false },
})

const demos = computed(() => (props.only ? props.only.map((id) => allDemos.find((d) => d.id === id)).filter(Boolean) : allDemos))
const active = ref(0)
const typed = ref(demos.value[0].cmd.length) // chars of the command shown
const shown = ref(demos.value[0].lines.length) // output lines shown
const auto = ref(true)
const visible = ref(false)
const root = ref(null)
const reduced = usePreferredReducedMotion()

const current = computed(() => demos.value[active.value])
const typing = computed(() => typed.value < current.value.cmd.length)
const done = computed(() => !typing.value && shown.value >= current.value.lines.length)
const color = { red: 'text-red-400', green: 'text-emerald-400', yellow: 'text-amber-300', cyan: 'text-cyan-300', gray: 'text-slate-500', white: 'text-white' }

let timer
const wait = (ms) => new Promise((r) => (timer = setTimeout(r, ms)))
let run = 0

async function play(i) {
  const id = ++run
  active.value = i
  typed.value = 0
  shown.value = 0
  const d = demos.value[i]
  await wait(450)
  while (typed.value < d.cmd.length) {
    if (id !== run) return
    typed.value++
    await wait(38 + Math.random() * 45)
  }
  await wait(280)
  while (shown.value < d.lines.length) {
    if (id !== run) return
    shown.value++
    await wait(d.lines.length > 8 ? 45 : 140)
  }
  await wait(2800)
  while (!visible.value && id === run) await wait(400)
  if (id === run && auto.value) play((i + 1) % demos.value.length)
}

function pick(i) {
  auto.value = false
  if (reduced.value === 'reduce') {
    run++
    clearTimeout(timer)
    active.value = i
    typed.value = demos.value[i].cmd.length
    shown.value = demos.value[i].lines.length
  } else play(i)
}

useIntersectionObserver(root, ([e]) => (visible.value = e?.isIntersecting ?? false), { threshold: 0.2 })

onMounted(() => {
  if (reduced.value !== 'reduce') play(0)
})
onBeforeUnmount(() => {
  run++
  clearTimeout(timer)
})
</script>

<template>
  <div ref="root" class="not-prose flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] shadow-2xl shadow-slate-900/20 ring-1 ring-white/5">
    <!-- Title bar -->
    <div class="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
      <span class="flex gap-1.5" aria-hidden="true">
        <span class="size-3 rounded-full bg-red-400" /><span class="size-3 rounded-full bg-amber-400" /><span class="size-3 rounded-full bg-emerald-400" />
      </span>
      <span class="truncate font-mono text-xs text-slate-500">kotlin-artisan — ~/Messages</span>
      <span class="ml-auto hidden font-mono text-[10px] tracking-wider text-slate-600 uppercase sm:inline">real output</span>
    </div>

    <!-- Demo tabs -->
    <div role="tablist" aria-label="Commands to replay" class="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/10 px-2 py-1.5">
      <button
        v-for="(d, i) in demos"
        :key="d.id"
        role="tab"
        type="button"
        :aria-selected="i === active"
        class="shrink-0 rounded-md px-2.5 py-1 font-mono text-xs transition"
        :class="i === active ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'"
        @click="pick(i)"
      >
        {{ d.label }}
      </button>
    </div>

    <!-- Screen: fixed height so the page doesn't jump; wide tables scroll inside it -->
    <div class="overflow-x-auto px-4 py-4 sm:px-5" :class="compact ? 'h-[17rem]' : 'h-[21rem]'" role="tabpanel" :aria-label="current.cmd">
      <pre class="font-mono text-[11px] leading-[1.55] text-slate-200 sm:text-xs"><span class="text-violet-400">$ </span><span class="text-white">{{ current.cmd.slice(0, typed) }}</span><span v-if="typing" class="caret" aria-hidden="true" />
<template v-for="(l, i) in current.lines.slice(0, shown)" :key="`${current.id}-${i}`"><span v-for="(s, j) in l" :key="j" :class="color[s[0]]">{{ s[1] }}</span><span v-if="done && i === current.lines.length - 1 && /:\s*$/.test(l.at(-1)?.[1] ?? '')" class="caret" aria-hidden="true" />
</template></pre>
    </div>
  </div>
</template>

<style scoped>
.caret {
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-bottom: -0.2em;
  background: #34d399;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
