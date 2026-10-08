<script setup>
import { computed, reactive, ref } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { liveCount, profile, SITE_URL, socials } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'
import Avatar3D from '../Avatar3D.vue'

// A 3D business card that tilts toward the pointer and flips to show every way to reach me
// (blog: find-ravi-sorathiya-android-developer).
const DOMAIN = new URL(SITE_URL).host
const flipped = ref(false)
const tilt = reactive({ x: 0, y: 0, gx: 50, gy: 50, on: false })
const reduced = usePreferredReducedMotion()

const handle = (url) => new URL(url).pathname.split('/').filter(Boolean)[0]
const links = [
  { icon: 'mail', label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  ...socials.map((s) => ({ icon: s.icon, label: s.name, value: '@' + handle(s.url), href: s.url })),
]

function onMove(e) {
  if (reduced.value === 'reduce' || e.pointerType === 'touch') return
  const r = e.currentTarget.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  tilt.x = (0.5 - py) * 14
  tilt.y = (px - 0.5) * 18
  tilt.gx = px * 100
  tilt.gy = py * 100
  tilt.on = true
}
function reset() {
  Object.assign(tilt, { x: 0, y: 0, gx: 50, gy: 50, on: false })
}

const cardStyle = computed(() => ({
  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped.value ? 180 : 0)}deg)`,
}))
// The face turns further than the card, so it keeps looking at the cursor.
const faceTilt = computed(() => ({ x: tilt.x * 1.6, y: tilt.y * 1.6 }))
const glare = computed(() => ({
  background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.28), transparent 55%)`,
}))

const copied = ref(false)
async function copySite(e) {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(`${SITE_URL}/`)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // Clipboard blocked: the address is printed on the card.
  }
}
</script>

<template>
  <figure class="not-prose my-12">
    <div class="mx-auto w-full max-w-md [perspective:1200px]" @pointermove="onMove" @pointerleave="reset">
      <div
        class="relative aspect-[1.45] cursor-pointer sm:aspect-[1.7] rounded-3xl transition-transform duration-500 ease-out [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        :style="cardStyle"
        role="button"
        tabindex="0"
        :aria-pressed="flipped"
        :aria-label="flipped ? 'Show the front of the card' : 'Flip the card to see contact details'"
        @click="flipped = !flipped"
        @keydown.enter.prevent="flipped = !flipped"
        @keydown.space.prevent="flipped = !flipped"
      >
        <!-- Front -->
        <div class="absolute inset-0 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-brand-900/40 ring-1 ring-white/10 [backface-visibility:hidden] sm:p-7">
          <div class="absolute -top-16 -right-10 size-56 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
          <div class="absolute -bottom-20 -left-10 size-56 rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />
          <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
          <div class="pointer-events-none absolute inset-0 transition-opacity duration-300" :class="tilt.on ? 'opacity-100' : 'opacity-0'" :style="glare" aria-hidden="true" />

          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-start justify-between">
              <Avatar3D size="sm" :interactive="false" :tilt="faceTilt" class="!mx-0" />
              <span class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
                <span class="size-1.5 animate-pulse rounded-full bg-brand-400" /> {{ liveCount }} apps live
              </span>
            </div>
            <div>
              <p class="text-2xl font-bold tracking-tight sm:text-3xl">{{ profile.name }}</p>
              <p class="mt-1 font-mono text-xs text-brand-300 sm:text-sm">{{ profile.role }} · Kotlin · Compose</p>
              <div class="mt-4 flex items-center justify-between text-xs text-white/60">
                <span class="font-mono">{{ DOMAIN }}</span>
                <span class="inline-flex items-center gap-1">tap to flip <AppIcon name="arrow" class="size-3.5" /></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Back -->
        <div class="absolute inset-0 overflow-hidden rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6 dark:bg-slate-900 dark:ring-slate-700">
          <div class="flex h-full flex-col">
            <p class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Find me anywhere</p>
            <ul class="mt-2 grid flex-1 content-center gap-1">
              <li v-for="l in links" :key="l.label">
                <a
                  :href="l.href"
                  :target="l.href.startsWith('http') ? '_blank' : undefined"
                  rel="me noopener"
                  :tabindex="flipped ? 0 : -1"
                  class="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-brand-500/10"
                  @click.stop
                >
                  <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-brand-gradient group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                    <AppIcon :name="l.icon" class="size-3.5" />
                  </span>
                  <span class="w-16 shrink-0 text-xs text-slate-400">{{ l.label }}</span>
                  <span class="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{{ l.value }}</span>
                </a>
              </li>
            </ul>
            <button
              type="button"
              :tabindex="flipped ? 0 : -1"
              class="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition"
              :class="copied ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-brand-gradient text-white'"
              @click="copySite"
            >
              <AppIcon :name="copied ? 'check' : 'copy'" class="size-3.5" /> {{ copied ? 'Copied — bookmark it' : `Copy ${DOMAIN}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <figcaption class="mt-5 text-center text-xs text-slate-500">Move your cursor over the card, then tap it to flip.</figcaption>
  </figure>
</template>
