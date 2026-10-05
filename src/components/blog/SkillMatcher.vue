<script setup>
import { computed, ref } from 'vue'

// A toy version of how Claude Code picks a skill from its description (blog: ai-workflow-android-developer).
// The skills and their triggers are summarised from my real ~/.claude/skills.
const skills = [
  {
    name: 'screen-ad-wiring',
    does: 'Wires a native or banner ad onto a screen as one unit: the AdsConstant.kt fallback, the RemoteConfigManager.kt block, the shimmer layout and the Activity code.',
    why: 'A half-wired ad (a constant with no Remote Config block) silently never gets a live value.',
    words: ['ad', 'ads', 'banner', 'native', 'shimmer', 'adsconstant', 'remote', 'config', 'admob'],
  },
  {
    name: 'android-splash-screen',
    does: 'Sets up the SplashScreen API, or fixes a stretched/cropped splash logo using the icon safe-zone maths.',
    why: 'A distorted logo is almost always an asset-size problem, not a config problem.',
    words: ['splash', 'launch', 'logo', 'stretched', 'cropped', 'startup', 'boot', 'icon'],
  },
  {
    name: 'android-permission-flow',
    does: 'Writes the grant/deny branch: log the event, retry the system dialog, or send the user to Settings.',
    why: 'shouldShowRequestPermissionRationale() is false both before the first ask and after "Don\'t ask again".',
    words: ['permission', 'permissions', 'denied', 'deny', 'rationale', 'settings', 'grant', 'camera', 'contacts'],
  },
  {
    name: 'token-lean-code',
    does: 'Keeps code and chat lean: no filler comments, refer to file:line instead of pasting code back.',
    why: 'Wasted tokens are invisible per reply but add up across a long session.',
    words: ['refactor', 'implement', 'feature', 'edit', 'fix', 'bug', 'code', 'write'],
  },
]

const examples = ['add a native ad with shimmer on the history screen', 'the splash logo looks stretched on Pixel', 'user denied camera permission twice', 'refactor this ViewModel']
const prompt = ref(examples[0])

const ranked = computed(() => {
  const tokens = prompt.value.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  return skills
    .map((s) => ({ ...s, score: tokens.filter((t) => s.words.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
})
const best = computed(() => (ranked.value[0].score ? ranked.value[0] : null))
const max = computed(() => Math.max(1, ...ranked.value.map((s) => s.score)))
</script>

<template>
  <figure class="not-prose card my-8 p-5 sm:p-6">
    <figcaption class="text-sm font-semibold text-slate-900 dark:text-white">
      Which skill would load? <span class="font-normal text-slate-500">Type a request.</span>
    </figcaption>

    <label class="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-500 dark:border-slate-700 dark:bg-slate-900">
      <span class="font-mono text-sm text-brand-600 dark:text-brand-400">&gt;</span>
      <input v-model="prompt" type="text" aria-label="Request to the agent" class="w-full bg-transparent text-sm outline-none" placeholder="e.g. add a banner ad on settings" />
    </label>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="e in examples"
        :key="e"
        type="button"
        class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600 hover:bg-brand-500/15 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-brand-300"
        @click="prompt = e"
      >
        {{ e }}
      </button>
    </div>

    <ul class="mt-5 space-y-2">
      <li v-for="s in ranked" :key="s.name" class="grid grid-cols-[9.5rem_1fr] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr]">
        <code class="truncate font-mono" :class="best?.name === s.name ? 'font-bold text-brand-700 dark:text-brand-300' : 'text-slate-500'">{{ s.name }}</code>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-full rounded-full transition-[width] duration-500" :class="best?.name === s.name ? 'bg-brand-gradient' : 'bg-slate-300 dark:bg-slate-600'" :style="{ width: `${(s.score / max) * 100}%` }" />
        </div>
      </li>
    </ul>

    <div class="mt-5 min-h-20 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60">
      <template v-if="best">
        <p class="text-slate-700 dark:text-slate-200"><span class="font-semibold">Loads {{ best.name }}:</span> {{ best.does }}</p>
        <p class="mt-1.5 text-xs text-slate-500">Why it exists: {{ best.why }}</p>
      </template>
      <p v-else class="text-slate-500">No skill matches, so the agent falls back to CLAUDE.md and its general knowledge.</p>
    </div>
    <p class="mt-2 text-[11px] text-slate-400">Simplified: the real matching is done by the model reading each skill's description, not keyword counts.</p>
  </figure>
</template>
