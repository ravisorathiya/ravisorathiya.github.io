<script setup>
// Mobile-only floating tab bar in the iOS "liquid glass" style: a frosted pill
// with a glass droplet that springs (and briefly stretches) to the active tab,
// and that compacts while scrolling down, like the iOS Safari tab bar.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener, useWindowScroll } from '@vueuse/core'
import { nav } from '../data/portfolio'
import AppIcon from './AppIcon.vue'

const route = useRoute()
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const activeIndex = computed(() => nav.findIndex((item) => isActive(item.to)))

const tabs = []
const blob = ref({ x: 0, w: 0, ready: false })

function place() {
  const el = tabs[activeIndex.value]?.$el
  if (!el) return (blob.value = { ...blob.value, ready: false })
  blob.value = { x: el.offsetLeft, w: el.offsetWidth, ready: true }
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
    <div class="glass relative flex items-center rounded-full p-1.5" :class="{ compact }">
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
        class="tab relative z-10 flex flex-col items-center justify-center rounded-full text-slate-600 dark:text-slate-300"
        :class="{ 'text-brand-600! dark:text-brand-400!': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        :aria-label="item.label"
      >
        <AppIcon :name="item.icon" class="icon" />
        <span class="label text-[10px] font-semibold leading-none">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.glass {
  background: linear-gradient(135deg, rgb(255 255 255 / 0.62), rgb(255 255 255 / 0.38));
  backdrop-filter: blur(22px) saturate(190%);
  -webkit-backdrop-filter: blur(22px) saturate(190%);
  border: 1px solid rgb(255 255 255 / 0.55);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.85),
    inset 0 -1px 1px rgb(15 23 42 / 0.06),
    0 10px 30px -8px rgb(15 23 42 / 0.28),
    0 2px 6px rgb(15 23 42 / 0.08);
}
/* Specular sheen across the top edge, like light on curved glass. */
.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(120% 70% at 20% 0%, rgb(255 255 255 / 0.55), transparent 55%);
  mix-blend-mode: soft-light;
}
:global(.dark) .glass {
  background: linear-gradient(135deg, rgb(30 41 59 / 0.6), rgb(2 6 23 / 0.42));
  border-color: rgb(255 255 255 / 0.12);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.16),
    inset 0 -1px 1px rgb(0 0 0 / 0.3),
    0 12px 32px -8px rgb(0 0 0 / 0.6);
}
:global(.dark) .glass::before {
  background: radial-gradient(120% 70% at 20% 0%, rgb(255 255 255 / 0.18), transparent 55%);
}

.tab {
  width: 3.75rem;
  height: 3.25rem;
  gap: 0.25rem;
  transition: width 0.3s ease, height 0.3s ease, transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.tab:active { transform: scale(0.9); }
.icon { width: 1.4rem; height: 1.4rem; transition: transform 0.3s ease; }
.label { transition: opacity 0.2s ease, max-height 0.3s ease; max-height: 1rem; }

.compact .tab { width: 3rem; height: 2.5rem; gap: 0; }
.compact .label { opacity: 0; max-height: 0; }
.compact .icon { transform: scale(0.92); }

/* The droplet: springs to the active tab with a little overshoot. */
.blob {
  transition:
    transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.drop {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.55));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 1),
    inset 0 -2px 4px rgb(16 185 129 / 0.12),
    0 4px 12px -2px rgb(15 23 42 / 0.18);
  animation: morph 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
:global(.dark) .drop {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.2), rgb(255 255 255 / 0.07));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.3),
    inset 0 -2px 4px rgb(16 185 129 / 0.15),
    0 4px 12px -2px rgb(0 0 0 / 0.5);
}
/* Liquid stretch while it travels, then settles back into shape. */
@keyframes morph {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.22, 0.86); }
  60% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}

@media (prefers-reduced-motion: reduce) {
  .blob, .tab, .icon, .label { transition: none; }
  .drop { animation: none; }
}
</style>
