<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Live keycaps for the site-wide search (blog: find-ravi-sorathiya-android-developer).
// The keys press down as you hold them; the button sends the same shortcut the palette listens for.
const mod = ref('Ctrl') // swapped to ⌘ on Apple devices after mount (SSR-safe)
const modDown = ref(false)
const kDown = ref(false)

function onKey(e) {
  const down = e.type === 'keydown'
  if (e.key === 'Control' || e.key === 'Meta') modDown.value = down
  if (e.key === 'k' || e.key === 'K') kDown.value = down && (e.ctrlKey || e.metaKey)
  if (!down && (e.key === 'Control' || e.key === 'Meta')) kDown.value = false
}
function reset() {
  modDown.value = kDown.value = false
}

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) mod.value = '⌘'
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKey)
  window.addEventListener('blur', reset)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('keyup', onKey)
  window.removeEventListener('blur', reset)
})

function openSearch() {
  modDown.value = kDown.value = true
  setTimeout(reset, 180)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: mod.value === '⌘', bubbles: true }))
}

const cap =
  'grid h-14 min-w-14 place-items-center rounded-xl border border-slate-300 bg-gradient-to-b from-white to-slate-100 px-3 font-mono text-lg font-semibold text-slate-700 transition-all duration-100 dark:border-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100'
const up = 'shadow-[0_5px_0_0_rgb(203_213_225)] dark:shadow-[0_5px_0_0_rgb(15_23_42)]'
const down = 'translate-y-[5px] shadow-none ring-2 ring-brand-500'
</script>

<template>
  <figure class="not-prose card my-12 flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
    <div class="flex items-center gap-2" aria-hidden="true">
      <kbd :class="[cap, modDown ? down : up]">{{ mod }}</kbd>
      <span class="text-slate-400">+</span>
      <kbd :class="[cap, kDown ? down : up]">K</kbd>
    </div>
    <figcaption class="text-center sm:text-left">
      <p class="font-mono text-xs text-brand-600 dark:text-brand-400">// fastest way in</p>
      <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Search the whole site from anywhere</p>
      <p class="mt-1 text-sm text-slate-500">
        Press <strong class="font-semibold text-slate-700 dark:text-slate-300">{{ mod }} K</strong> on any page to search every app, article and feature, or
        <button type="button" class="font-semibold text-brand-600 underline decoration-dotted underline-offset-4 dark:text-brand-400" @click="openSearch">open it now</button>.
      </p>
    </figcaption>
  </figure>
</template>
