<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener, useIntersectionObserver, usePreferredReducedMotion } from '@vueuse/core'
import { liveCount, profile, socials } from '../data/portfolio'
import AppIcon from './AppIcon.vue'

// A layered 3D avatar disc: it turns to look at the cursor anywhere on the page,
// springs into place, spins on click and (optionally) has the socials orbiting it.
// Motion runs in one rAF loop that writes CSS variables, so Vue never re-renders per frame.
const props = defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
  orbit: { type: Boolean, default: false },
  chip: { type: Boolean, default: undefined }, // "N apps live" pill; defaults to on for md/lg
  interactive: { type: Boolean, default: true }, // click to spin
  tilt: { type: Object, default: null }, // external { x, y } in degrees, replaces cursor tracking
})

const PX = { sm: 56, md: 200, lg: 240 }[props.size] ?? 200
const D = PX / 240 // depth scale for the layers
const R = Math.min(Math.round(PX * 0.72), 144) // orbit radius, capped so it fits a 328px phone column
const SAT = 40 // satellite size
const PAD = props.orbit ? 28 : Math.round(PX * 0.06)
const W = props.orbit ? 2 * R + SAT : PX
const H = PX + PAD * 2 + (props.size === 'sm' ? 0 : Math.round(PX * 0.12))
const CY = PAD + PX / 2
const showChip = computed(() => props.chip ?? props.size !== 'sm')

const handle = (url) => new URL(url).pathname.split('/').filter(Boolean)[0]
const satellites = props.orbit
  ? [
      { icon: 'mail', label: `Email ${profile.email}`, href: `mailto:${profile.email}` },
      ...socials.map((s) => ({ icon: s.icon, label: `${s.name} @${handle(s.url)}`, href: s.url })),
    ]
  : []

const root = ref(null)
const satEls = []
const bursts = ref([])
const reduced = usePreferredReducedMotion()
let visible = false
let raf = 0
let paused = false
let pointer = null
let lastMove = 0
const cur = { x: 0, y: 0, vx: 0, vy: 0, spin: 0, spinTo: 0, a: 0 }

useEventListener(
  typeof window !== 'undefined' ? window : null,
  'pointermove',
  (e) => {
    if (e.pointerType === 'touch') return
    pointer = { x: e.clientX, y: e.clientY }
    lastMove = performance.now()
  },
  { passive: true },
)

let entered = false
useIntersectionObserver(root, ([entry]) => {
  visible = entry?.isIntersecting ?? false
  if (!visible) return
  // First time on screen: whirl in with a full turn to catch the eye.
  if (!entered && props.interactive && reduced.value !== 'reduce') {
    entered = true
    cur.spin = -360
    cur.spinTo = 0
  }
  start()
})

// A little "drag me" bubble that invites the first interaction, then gets out of the way.
const hint = ref(false)
let hintTimers = []
function dismissHint() {
  hint.value = false
  hintTimers.forEach(clearTimeout)
}

const clamp = (v, m) => Math.max(-m, Math.min(m, v))

function target(now) {
  if (props.tilt) return { x: props.tilt.x, y: props.tilt.y }
  if (pointer && now - lastMove < 4000 && root.value) {
    const r = root.value.getBoundingClientRect()
    const dx = pointer.x - (r.left + r.width / 2)
    const dy = pointer.y - (r.top + CY)
    return { x: -18 * Math.tanh(dy / 380), y: 24 * Math.tanh(dx / 420) }
  }
  // Idle (or touch): drift on its own so it still feels alive.
  return { x: Math.sin(now / 1900) * 7, y: Math.cos(now / 2600) * 11 }
}

function place(now) {
  if (!satEls.length) return
  const n = satEls.length
  satEls.forEach((el, i) => {
    if (!el) return
    const a = cur.a + (i / n) * Math.PI * 2
    const z = Math.sin(a) // 1 = in front of the face, -1 = behind it
    const x = Math.cos(a) * R + cur.y * 1.2 * z
    const y = z * R * 0.3 + cur.x * 1.4 * Math.cos(a)
    const s = 0.78 + 0.22 * (z + 1) * 0.5
    el.style.transform = `translate(${x - SAT / 2}px, ${y - SAT / 2}px) scale(${s})`
    el.style.zIndex = z > 0 ? 3 : 1
    el.style.opacity = String(0.45 + 0.55 * ((z + 1) / 2))
  })
}

function frame(now) {
  raf = 0
  const el = root.value
  if (!el || !visible || reduced.value === 'reduce') return
  const t = target(now)
  // Under-damped spring: settles with a small, satisfying overshoot.
  cur.vx = (cur.vx + (t.x - cur.x) * 0.07) * 0.8
  cur.vy = (cur.vy + (t.y - cur.y) * 0.07) * 0.8
  cur.x += cur.vx
  cur.y += cur.vy
  if (!drag) cur.spin += (cur.spinTo - cur.spin) * 0.06
  if (props.orbit && !paused) cur.a += 0.006
  el.style.setProperty('--rx', `${clamp(cur.x, 30).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${(clamp(cur.y, 30) + cur.spin).toFixed(2)}deg`)
  el.style.setProperty('--gx', `${(50 - cur.y * 1.8).toFixed(1)}%`)
  el.style.setProperty('--gy', `${(40 + cur.x * 1.8).toFixed(1)}%`)
  el.style.setProperty('--sx', `${(-cur.y * 0.6).toFixed(1)}px`)
  place(now)
  raf = requestAnimationFrame(frame)
}

function start() {
  if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(frame)
}

const setSat = (i, el) => (satEls[i] = el)
const pause = (v) => (paused = v)

// Drag (mouse or finger) to whirl it a full 360°: it keeps the fling's momentum,
// then settles on the nearest whole turn so the face ends up looking forward again.
let drag = null
let dragged = false
function onDown(e) {
  if (!props.interactive || reduced.value === 'reduce' || e.button > 0) return
  dismissHint()
  drag ={ start: e.clientX, last: e.clientX, v: 0, moved: false }
  e.currentTarget.setPointerCapture?.(e.pointerId)
  start()
}
function onDrag(e) {
  if (!drag) return
  const dx = e.clientX - drag.last
  drag.last = e.clientX
  if (Math.abs(e.clientX - drag.start) > 5) drag.moved = true
  cur.spin += dx * 0.9
  drag.v = drag.v * 0.5 + dx * 0.45
}
function onUp() {
  if (!drag) return
  const d = drag
  drag = null
  dragged = d.moved
  if (!d.moved) return
  const fling = cur.spin + d.v * 22
  cur.spinTo = Math.round(fling / 360) * 360
  if (Math.abs(d.v) > 6) burst()
}
function onClick() {
  dismissHint()
  if (dragged) return (dragged = false)
  spin()
}

let burstId = 0
function spin() {
  if (!props.interactive || reduced.value === 'reduce') return
  cur.spinTo = Math.round(cur.spin / 360) * 360 + 360
  burst()
}
function burst() {
  const id = ++burstId
  const parts = Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 14) * Math.PI * 2 + Math.random() * 0.4
    const dist = PX * (0.6 + Math.random() * 0.35)
    return { dx: `${Math.cos(ang) * dist}px`, dy: `${Math.sin(ang) * dist}px`, hue: i % 3, delay: `${Math.random() * 80}ms` }
  })
  bursts.value.push({ id, parts })
  setTimeout(() => (bursts.value = bursts.value.filter((b) => b.id !== id)), 1100)
}

onMounted(() => {
  // Reduced motion: lay the orbit out once and stay still.
  place(0)
  start()
  if (props.interactive && props.size !== 'sm') {
    hintTimers = [setTimeout(() => (hint.value = true), 1600), setTimeout(() => (hint.value = false), 9000)]
  }
})
onBeforeUnmount(() => hintTimers.forEach(clearTimeout))
watch(reduced, (v) => (v === 'reduce' ? place(0) : start()))
onBeforeUnmount(() => raf && cancelAnimationFrame(raf))
</script>

<template>
  <div
    ref="root"
    class="a3d relative mx-auto select-none"
    :class="`a3d-${size}`"
    :style="{ width: `${W}px`, height: `${H}px`, '--px': `${PX}px`, '--d': D, '--cy': `${CY}px` }"
  >
    <!-- floor shadow -->
    <div
      v-if="size !== 'sm'"
      class="a3d-shadow pointer-events-none absolute left-1/2 rounded-[50%] bg-slate-900/25 blur-md dark:bg-black/60"
      :style="{ top: `${PAD + PX + PX * 0.04}px`, width: `${PX * 0.7}px`, height: `${PX * 0.1}px` }"
      aria-hidden="true"
    />

    <!-- sonar pulses radiating from behind the head -->
    <template v-if="size !== 'sm'">
      <span
        v-for="n in 2"
        :key="n"
        class="a3d-pulse pointer-events-none absolute left-1/2 rounded-full border-2 border-brand-400/60"
        :style="{ top: `${PAD}px`, width: `${PX}px`, height: `${PX}px`, marginLeft: `${-PX / 2}px`, animationDelay: `${(n - 1) * 1.6}s` }"
        aria-hidden="true"
      />
    </template>

    <Transition
      enter-from-class="opacity-0 translate-y-2 scale-90"
      leave-to-class="opacity-0 scale-90"
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-200"
    >
      <span
        v-if="hint"
        class="a3d-hint pointer-events-none absolute z-[5] rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-xl dark:bg-white dark:text-slate-900"
        :style="{ top: `${Math.max(0, PAD - 18)}px`, left: `calc(50% + ${PX * 0.22}px)` }"
        aria-hidden="true"
      >
        👋 drag me · 360°
      </span>
    </Transition>

    <div class="a3d-float absolute left-1/2 z-[2]" :style="{ top: `${PAD}px`, width: `${PX}px`, height: `${PX}px`, marginLeft: `${-PX / 2}px` }">
      <component
        :is="interactive ? 'button' : 'div'"
        :type="interactive ? 'button' : undefined"
        class="a3d-view block size-full rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        :class="interactive ? 'cursor-pointer' : ''"
        :aria-label="interactive ? `${profile.name} — click or drag to spin 360°` : undefined"
        :title="interactive ? 'Drag me around — 360°' : undefined"
        :aria-hidden="interactive ? undefined : 'true'"
        :style="interactive ? { touchAction: 'pan-y' } : undefined"
        @pointerdown="onDown"
        @pointermove="onDrag"
        @pointerup="onUp"
        @pointercancel="onUp"
        @lostpointercapture="onUp"
        @click="onClick"
      >
        <span class="a3d-stage">
          <span class="a3d-halo" aria-hidden="true" />
          <span class="a3d-ring-wrap" aria-hidden="true"><span class="a3d-ring" /></span>

          <!-- front: the photo -->
          <span class="a3d-face bg-brand-gradient">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              :alt="interactive ? '' : profile.name"
              width="400"
              height="400"
              draggable="false"
              class="size-full rounded-full object-cover"
            />
            <span v-else class="grid size-full place-items-center font-extrabold text-white" :style="{ fontSize: `${PX * 0.32}px` }">RS</span>
          </span>
          <span class="a3d-shine" aria-hidden="true" />

          <!-- back: monogram -->
          <span class="a3d-back bg-brand-gradient" aria-hidden="true">
            <span class="font-extrabold text-white" :style="{ fontSize: `${PX * 0.3}px` }">RS</span>
            <span v-if="size !== 'sm'" class="mt-1 font-mono text-white/80" :style="{ fontSize: `${Math.max(9, PX * 0.075)}px` }">Kotlin · Compose</span>
          </span>

          <span v-if="showChip" class="a3d-chip" aria-hidden="true">
            <span class="size-1.5 animate-pulse rounded-full bg-brand-400" /> {{ liveCount }} apps live
          </span>
        </span>
      </component>
    </div>

    <!-- orbiting socials -->
    <a
      v-for="(s, i) in satellites"
      :key="s.href"
      :ref="(el) => setSat(i, el)"
      :href="s.href"
      :target="s.href.startsWith('http') ? '_blank' : undefined"
      rel="me noopener"
      :aria-label="s.label"
      :title="s.label"
      class="a3d-sat group absolute left-1/2 grid place-items-center"
      :style="{ top: `${CY}px`, width: `${SAT}px`, height: `${SAT}px` }"
      @pointerenter="pause(true)"
      @pointerleave="pause(false)"
      @focus="pause(true)"
      @blur="pause(false)"
    >
      <span
        class="grid size-full place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition duration-200 group-hover:scale-125 group-hover:border-brand-500 group-hover:bg-brand-gradient group-hover:text-white group-focus-visible:scale-125 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
      >
        <AppIcon :name="s.icon" class="size-[18px]" />
      </span>
    </a>

    <!-- click burst -->
    <span
      v-for="b in bursts"
      :key="b.id"
      class="pointer-events-none absolute left-1/2 z-[4]"
      :style="{ top: `${CY}px` }"
      aria-hidden="true"
    >
      <span
        v-for="(p, j) in b.parts"
        :key="j"
        class="a3d-spark"
        :class="['bg-brand-400', 'bg-teal-300', 'bg-lime-300'][p.hue]"
        :style="{ '--dx': p.dx, '--dy': p.dy, animationDelay: p.delay }"
      />
    </span>
  </div>
</template>

<style scoped>
.a3d {
  --rx: 0deg;
  --ry: 0deg;
  --gx: 50%;
  --gy: 40%;
  --sx: 0px;
  isolation: isolate;
}
.a3d-view {
  perspective: calc(var(--px) * 5);
}
.a3d-stage {
  position: absolute;
  inset: 0;
  display: block;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
}
.a3d-stage > * {
  position: absolute;
  border-radius: 9999px;
}
.a3d-halo {
  inset: -22%;
  background: radial-gradient(closest-side, rgb(16 185 129 / 0.45), transparent);
  filter: blur(calc(var(--px) * 0.08));
  transform: translateZ(calc(-70px * var(--d)));
}
.a3d-ring-wrap {
  inset: -9%;
  transform: translateZ(calc(-36px * var(--d)));
  backface-visibility: hidden;
}
.a3d-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: conic-gradient(from 0deg, #10b981, #22c55e, transparent 35%, #0d9488 55%, #34d399 75%, transparent 90%, #10b981);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - max(3px, calc(var(--px) * 0.035))), #000 calc(100% - max(2px, calc(var(--px) * 0.03))));
  mask: radial-gradient(farthest-side, transparent calc(100% - max(3px, calc(var(--px) * 0.035))), #000 calc(100% - max(2px, calc(var(--px) * 0.03))));
}
.a3d-face {
  inset: 0;
  padding: max(2px, calc(var(--px) * 0.025));
  backface-visibility: hidden;
  box-shadow: 0 20px 40px -12px rgb(6 78 59 / 0.55);
}
.a3d-shine {
  inset: 0;
  pointer-events: none;
  backface-visibility: hidden;
  transform: translateZ(calc(22px * var(--d)));
  background:
    radial-gradient(circle at var(--gx) var(--gy), rgb(255 255 255 / 0.38), transparent 45%),
    linear-gradient(160deg, rgb(255 255 255 / 0.16), transparent 40%);
}
.a3d-back {
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transform: rotateY(180deg);
}
.a3d-chip {
  left: 50%;
  bottom: -6%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: rgb(2 6 23 / 0.82);
  border: 1px solid rgb(255 255 255 / 0.15);
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.5);
  backface-visibility: hidden;
  transform: translateX(-50%) translateZ(calc(52px * var(--d)));
}
.a3d-shadow {
  transform: translateX(calc(-50% + var(--sx)));
}
.a3d-sat {
  will-change: transform;
}
.a3d-spark {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  opacity: 0;
  animation: a3d-burst 900ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
@keyframes a3d-burst {
  0% { opacity: 1; transform: translate(0, 0) scale(1.2); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2); }
}
.a3d-face {
  overflow: hidden;
}
.a3d-face::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 38%, rgb(255 255 255 / 0.45) 48%, rgb(110 231 183 / 0.35) 52%, transparent 62%);
  transform: translateX(-120%);
}
.a3d-halo {
  transition: opacity 0.3s, filter 0.3s;
  opacity: 0.8;
}
.a3d-view:hover .a3d-halo,
.a3d-view:focus-visible .a3d-halo {
  opacity: 1;
  filter: blur(calc(var(--px) * 0.05)) brightness(1.4);
}
.a3d-pulse {
  opacity: 0;
}
.a3d-hint::after {
  content: '';
  position: absolute;
  left: 14px;
  bottom: -4px;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}
@media (prefers-reduced-motion: no-preference) {
  .a3d-ring {
    animation: a3d-spin 7s linear infinite;
  }
  .a3d-view:hover .a3d-ring {
    animation-duration: 1.6s;
  }
  .a3d-face::after {
    animation: a3d-sweep 4.5s ease-in-out 1.2s infinite;
  }
  .a3d-pulse {
    animation: a3d-pulse 3.2s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
  }
  .a3d-hint {
    animation: a3d-bob 1.4s ease-in-out infinite;
  }
  .a3d-md .a3d-float,
  .a3d-lg .a3d-float {
    animation: a3d-float 5s ease-in-out infinite;
  }
}
@keyframes a3d-spin {
  to { transform: rotate(360deg); }
}
@keyframes a3d-sweep {
  0% { transform: translateX(-120%); }
  35%, 100% { transform: translateX(120%); }
}
@keyframes a3d-pulse {
  0% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.55); }
}
@keyframes a3d-bob {
  50% { translate: 0 -4px; }
}
@keyframes a3d-float {
  50% { transform: translateY(-7px); }
}
</style>
