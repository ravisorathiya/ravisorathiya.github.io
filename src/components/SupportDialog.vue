<script setup>
import { nextTick, ref, watch } from 'vue'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { support } from '../data/portfolio'
import AppIcon from './AppIcon.vue'

const open = defineModel({ type: Boolean, default: false })
const closeBtn = ref(null)
const copied = ref(false)
const locked = useScrollLock(typeof document !== 'undefined' ? document.body : null)

watch(open, async (v) => {
  locked.value = v
  copied.value = false
  if (v) {
    await nextTick()
    closeBtn.value?.focus()
  }
})
onKeyStroke('Escape', () => (open.value = false))

async function copyId() {
  try {
    await navigator.clipboard.writeText(support.payId)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard blocked: the ID is still visible and selectable.
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
        @click.self="open = false"
      >
        <div
          class="card relative w-full max-w-sm overflow-hidden p-6 text-center shadow-2xl sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
        >
          <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber-400/15 to-transparent" />
          <button
            ref="closeBtn"
            class="absolute top-3 right-3 grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
            @click="open = false"
          >
            <AppIcon name="close" class="size-5" />
          </button>

          <span class="relative mx-auto grid size-12 place-items-center rounded-full bg-amber-400/15 text-amber-500">
            <AppIcon name="heart" class="size-6" />
          </span>
          <h2 id="support-title" class="relative mt-4 text-xl font-semibold text-slate-900 dark:text-white">Support my work</h2>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Enjoy the apps or articles? Buy me a coffee in crypto.
          </p>

          <div class="mx-auto mt-6 w-52 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-slate-200 sm:w-56 dark:ring-0">
            <img :src="support.qr" :alt="`${support.label} QR code for ${support.payId}`" width="480" height="480" class="w-full" />
          </div>
          <p class="mt-3 text-xs text-slate-500">Scan with the Binance app → Pay</p>

          <div class="mt-5 flex items-center justify-between gap-2 rounded-xl border border-slate-200 py-1.5 pr-1.5 pl-4 dark:border-slate-800">
            <span class="min-w-0 text-left">
              <span class="block text-[11px] tracking-wide text-slate-400 uppercase">{{ support.label }} ID</span>
              <span class="block truncate font-mono font-medium text-slate-900 select-all dark:text-white">{{ support.payId }}</span>
            </span>
            <button
              class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition"
              :class="copied ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
              @click="copyId"
            >
              <AppIcon :name="copied ? 'check' : 'copy'" class="size-4" />
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
