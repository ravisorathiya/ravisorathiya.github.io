<script setup>
// Mobile-only floating tab bar in the iOS "liquid glass" style: a frosted pill
// with a glass lens that springs to the active tab. Like iOS, you can press and
// slide the lens across the tabs; letting go opens the tab under your finger.
// The bar compacts while scrolling down, like the iOS Safari tab bar.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventListener, useWindowScroll } from '@vueuse/core'
import { nav } from '../data/portfolio'
import AppIcon from './AppIcon.vue'

const route = useRoute()
const router = useRouter()
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const activeIndex = computed(() => nav.findIndex((item) => isActive(item.to)))

const bar = ref(null)
const tabs = []
const blob = ref({ x: 0, w: 0, ready: false })

function place() {
  const el = tabs[activeIndex.value]?.$el
  if (!el) return (blob.value = { ...blob.value, ready: false })
  blob.value = { x: el.offsetLeft, w: el.offsetWidth, ready: true }
}

// Drag-to-select. Pointer capture only starts once the finger actually slides,
// so a plain tap still reaches the RouterLink as a normal click.
const drag = ref(null) // { startX, moved, index }
const lit = computed(() => (drag.value?.moved ? drag.value.index : activeIndex.value))

function tabAt(x) {
  let best = 0
  tabs.forEach((t, i) => {
    const el = t?.$el
    if (!el) return
    const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - x)
    const bd = Math.abs(tabs[best].$el.offsetLeft + tabs[best].$el.offsetWidth / 2 - x)
    if (d < bd) best = i
  })
  return best
}

function onDown(e) {
  if (e.button > 0) return
  drag.value = { startX: e.clientX, moved: false, index: activeIndex.value }
}
function onMove(e) {
  const d = drag.value
  if (!d) return
  if (!d.moved) {
    if (Math.abs(e.clientX - d.startX) < 8) return
    d.moved = true
    bar.value.setPointerCapture(e.pointerId)
  }
  const rect = bar.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const w = blob.value.w
  const pad = 6
  blob.value = { ...blob.value, x: Math.min(Math.max(x - w / 2, pad), rect.width - pad - w) }
  d.index = tabAt(x)
}
function onUp() {
  const d = drag.value
  drag.value = null
  if (!d?.moved) return
  suppressClick = true
  setTimeout(() => (suppressClick = false))
  const to = nav[d.index]?.to
  if (to && d.index !== activeIndex.value) router.push(to)
  else place()
}
let suppressClick = false
function onClickCapture(e) {
  if (!suppressClick) return
  e.preventDefault()
  e.stopPropagation()
}

// Compact while scrolling down, expand again on scroll up or near the top.
const { y } = useWindowScroll()
const compact = ref(false)
watch(y, (now, before) => {
  if (now < 80) compact.value = false
  else if (Math.abs(now - before) > 4) compact.value = now > before
})

onMounted(() => {
  place()
  useEventListener('resize', place)
})
watch([activeIndex, compact], () => nextTick(place))
// The bar's width animates when compacting; re-measure once it settles.
watch(compact, () => setTimeout(place, 320))
</script>

<template>
  <nav
    class="fixed inset-x-0 z-40 flex justify-center px-4 md:hidden"
    style="bottom: max(0.75rem, env(safe-area-inset-bottom))"
    aria-label="Primary"
  >
    <div
      ref="bar"
      class="glass relative flex items-center rounded-full p-1.5"
      :class="{ compact, dragging: drag?.moved }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @click.capture="onClickCapture"
    >
      <span
        v-show="blob.ready"
        class="blob absolute top-1.5 bottom-1.5 left-0 rounded-full"
        :style="{ transform: `translateX(${blob.x}px)`, width: `${blob.w}px` }"
        aria-hidden="true"
      >
        <span :key="activeIndex" class="drop block size-full rounded-full" />
      </span>

      <RouterLink
        v-for="(item, i) in nav"
        :key="item.to"
        :ref="(el) => (tabs[i] = el)"
        :to="item.to"
        class="tab relative z-10 flex flex-col items-center justify-center rounded-full"
        :class="{ on: lit === i }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        :aria-label="item.label"
        draggable="false"
      >
        <AppIcon :name="item.icon" class="icon" />
        <span class="label text-[10px] font-semibold leading-none">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
/* Clear, neutral glass: the page shows through, tinted only by the blur. */
.glass {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  background: rgb(250 250 252 / 0.55);
  backdrop-filter: blur(24px) saturate(180%) brightness(1.04);
  -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.04);
  border: 0.5px solid rgb(255 255 255 / 0.7);
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.9),
    inset 0 -1px 2px rgb(0 0 0 / 0.04),
    0 8px 28px -6px rgb(0 0 0 / 0.18),
    0 1px 3px rgb(0 0 0 / 0.06);
}
/* Specular sheen across the top edge, like light on curved glass. */
.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.45), transparent 50%);
}
:global(.dark) .glass {
  background: rgb(28 28 32 / 0.55);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-color: rgb(255 255 255 / 0.14);
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.12),
    0 10px 30px -6px rgb(0 0 0 / 0.65);
}
:global(.dark) .glass::before {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.08), transparent 50%);
}

.tab {
  width: 3.75rem;
  height: 3.25rem;
  gap: 0.25rem;
  color: rgb(60 60 67 / 0.85); /* iOS secondary label */
  transition: width 0.3s ease, height 0.3s ease, transform 0.15s ease, color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
:global(.dark) .tab { color: rgb(235 235 245 / 0.7); }
.tab.on { color: var(--color-brand-600); }
:global(.dark) .tab.on { color: var(--color-brand-400); }
.tab:active { transform: scale(0.92); }
.dragging .tab:active { transform: none; }
.icon { width: 1.4rem; height: 1.4rem; transition: transform 0.3s ease; }
.on .icon { transform: scale(1.06); }
.label { transition: opacity 0.2s ease, max-height 0.3s ease; max-height: 1rem; }

.compact .tab { width: 3rem; height: 2.5rem; gap: 0; }
.compact .label { opacity: 0; max-height: 0; }
.compact .icon { transform: scale(0.92); }

/* The lens: springs to the active tab with a little overshoot. */
.blob {
  transition:
    transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.drop {
  background: rgb(0 0 0 / 0.06);
  box-shadow: inset 0 0.5px 0 rgb(255 255 255 / 0.6);
  animation: morph 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, box-shadow 0.2s ease;
}
:global(.dark) .drop {
  background: rgb(255 255 255 / 0.12);
  box-shadow: inset 0 0.5px 0 rgb(255 255 255 / 0.25);
}
/* While sliding: the lens follows the finger, swells and turns to clear glass. */
.dragging .blob { transition: width 0.2s ease; }
.dragging .drop {
  transform: scale(1.18, 1.28);
  background: rgb(255 255 255 / 0.35);
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.95),
    inset 0 -1px 2px rgb(0 0 0 / 0.08),
    0 6px 18px -4px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(2px) saturate(200%) brightness(1.08);
  -webkit-backdrop-filter: blur(2px) saturate(200%) brightness(1.08);
}
:global(.dark) .dragging .drop {
  background: rgb(255 255 255 / 0.16);
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.35),
    0 6px 18px -4px rgb(0 0 0 / 0.6);
}
/* Liquid stretch when it lands on a new tab, then settles back into shape. */
@keyframes morph {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.22, 0.86); }
  60% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}

@media (prefers-reduced-motion: reduce) {
  .blob, .tab, .icon, .label, .drop { transition: none; }
  .drop { animation: none; }
}
</style>
