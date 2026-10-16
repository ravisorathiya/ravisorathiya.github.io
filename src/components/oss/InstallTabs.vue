<script setup>
// One-line install commands for kotlin-artisan, one tab per OS, with a copy button.
// Picks the visitor's OS after mount (SSR renders the Windows tab).
import { onMounted, ref } from 'vue'
import { artisan } from '../../data/oss'
import AppIcon from '../AppIcon.vue'

defineProps({ showSource: { type: Boolean, default: true } })

const active = ref('windows')
const copied = ref(false)

onMounted(() => {
  if (/Mac|Linux|X11/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)) active.value = 'unix'
})

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* clipboard blocked: the command is still selectable */
  }
}
</script>

<template>
  <div class="not-prose min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60">
    <div role="tablist" aria-label="Install on" class="flex border-b border-slate-200 text-sm dark:border-slate-800">
      <button
        v-for="o in artisan.install.filter((x) => showSource || x.id !== 'source')"
        :key="o.id"
        role="tab"
        type="button"
        :aria-selected="o.id === active"
        class="-mb-px border-b-2 px-3 py-2 transition"
        :class="o.id === active ? 'border-brand-500 font-semibold text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        @click="active = o.id"
      >
        {{ o.label }}
      </button>
    </div>
    <template v-for="o in artisan.install" :key="o.id">
      <div v-if="o.id === active" role="tabpanel" class="flex items-start gap-2 p-3">
        <pre class="no-scrollbar min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-slate-700 sm:text-[13px] dark:text-slate-300"><span class="text-brand-600 select-none dark:text-brand-400">{{ o.shell === 'PowerShell' ? 'PS> ' : '$ ' }}</span>{{ o.cmd }}</pre>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
          :aria-label="copied ? 'Copied' : `Copy the ${o.label} install command`"
          @click="copy(o.cmd)"
        >
          <AppIcon :name="copied ? 'check' : 'copy'" class="size-3.5" /> {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </template>
  </div>
</template>
