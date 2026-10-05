<script setup>
// Site-wide galaxy background: three parallax layers of twinkling stars,
// constellation lines that form around the cursor, and the odd shooting star.
// Canvas-only, paused while the tab is hidden, static under reduced motion.
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const canvas = useTemplateRef('canvas')
let cleanup = () => {}

onMounted(() => {
  const el = canvas.value
  const ctx = el.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  const LAYERS = [
    { depth: 0.15, size: [0.4, 0.9], speed: 0.02 },
    { depth: 0.35, size: [0.7, 1.3], speed: 0.04 },
    { depth: 0.7, size: [1.1, 1.9], speed: 0.07 },
  ]
  const LINK_DIST = 120
  const CURSOR_DIST = 190
  const rand = (a, b) => a + Math.random() * (b - a)

  let w = 0
  let h = 0
  let stars = []
  let meteors = []
  let nextMeteor = performance.now() + rand(3000, 7000)
  const mouse = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0 }
  let raf = 0

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = window.innerWidth
    h = window.innerHeight
    el.width = w * dpr
    el.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = Math.min(260, Math.round((w * h) / 7000))
    stars = Array.from({ length: count }, (_, i) => {
      const layer = LAYERS[i % LAYERS.length]
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(...layer.size),
        layer,
        phase: Math.random() * Math.PI * 2,
        twinkle: rand(0.6, 1.8),
        // A few coloured stars among the white ones.
        hue: Math.random() < 0.18 ? (Math.random() < 0.5 ? 160 : 200) : null,
      }
    })
    if (reduced) draw(0)
  }

  function draw(t) {
    const dark = root.classList.contains('dark')
    ctx.clearRect(0, 0, w, h)

    // Ease the parallax offset towards the cursor.
    mouse.px += (mouse.tx - mouse.px) * 0.05
    mouse.py += (mouse.ty - mouse.py) * 0.05
    const scroll = window.scrollY

    const visible = []
    for (const s of stars) {
      if (!reduced) {
        s.y -= s.layer.speed
        if (s.y < -5) s.y += h + 10
      }
      const x = (((s.x - mouse.px * s.layer.depth * 30) % w) + w) % w
      const y = (((s.y - mouse.py * s.layer.depth * 30 - scroll * s.layer.depth * 0.15) % h) + h) % h
      const a = reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * 0.001 * s.twinkle + s.phase))
      const alpha = dark ? a : a * 0.55
      const color = s.hue != null
        ? `hsla(${s.hue}, 80%, ${dark ? 70 : 40}%, ${alpha})`
        : dark ? `rgba(226, 232, 240, ${alpha})` : `rgba(15, 118, 110, ${alpha * 0.8})`
      ctx.beginPath()
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      // Soft glow on the biggest stars.
      if (dark && s.r > 1.5) {
        ctx.beginPath()
        ctx.arc(x, y, s.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.08})`
        ctx.fill()
      }
      const dm = Math.hypot(x - mouse.x, y - mouse.y)
      if (dm < CURSOR_DIST) visible.push({ x, y, dm })
    }

    // Constellation: link stars close to the cursor (and to each other).
    for (let i = 0; i < visible.length; i++) {
      const p = visible[i]
      const fade = 1 - p.dm / CURSOR_DIST
      ctx.strokeStyle = dark ? `rgba(52, 211, 153, ${fade * 0.45})` : `rgba(5, 150, 105, ${fade * 0.35})`
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(mouse.x, mouse.y)
      ctx.stroke()
      for (let j = i + 1; j < visible.length; j++) {
        const q = visible[j]
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < LINK_DIST) {
          ctx.strokeStyle = dark
            ? `rgba(148, 163, 184, ${(1 - d / LINK_DIST) * fade * 0.5})`
            : `rgba(15, 118, 110, ${(1 - d / LINK_DIST) * fade * 0.3})`
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.stroke()
        }
      }
    }

    if (reduced) return

    // Shooting stars.
    if (t > nextMeteor) {
      meteors.push({ x: rand(w * 0.2, w), y: rand(-20, h * 0.4), vx: -rand(7, 11), vy: rand(3, 5), life: 1 })
      nextMeteor = t + rand(4000, 9000)
    }
    meteors = meteors.filter((m) => m.life > 0)
    for (const m of meteors) {
      const tail = 14
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail)
      g.addColorStop(0, dark ? `rgba(255, 255, 255, ${m.life})` : `rgba(5, 150, 105, ${m.life * 0.7})`)
      g.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail)
      ctx.stroke()
      m.x += m.vx
      m.y += m.vy
      m.life -= 0.012
    }
  }

  function loop(t) {
    draw(t)
    raf = requestAnimationFrame(loop)
  }
  function start() {
    cancelAnimationFrame(raf)
    if (!reduced && !document.hidden) raf = requestAnimationFrame(loop)
  }
  function onMove(e) {
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.tx = e.clientX / w - 0.5
    mouse.ty = e.clientY / h - 0.5
    if (reduced) draw(0)
  }
  function onLeave() {
    mouse.x = mouse.y = -9999
  }

  resize()
  start()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  document.addEventListener('visibilitychange', start)
  // Redraw immediately when the theme changes (matters for the static mode).
  const themeObserver = new MutationObserver(() => draw(performance.now()))
  themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

  cleanup = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
    document.removeEventListener('visibilitychange', start)
    themeObserver.disconnect()
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-20" aria-hidden="true">
    <!-- Faint nebula glow behind the stars (dark mode only). -->
    <div class="absolute inset-0 hidden dark:block">
      <div class="absolute -top-40 -left-40 size-[36rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
      <div class="absolute top-1/3 -right-40 size-[32rem] rounded-full bg-indigo-500/[0.07] blur-3xl" />
      <div class="absolute -bottom-40 left-1/3 size-[30rem] rounded-full bg-teal-500/[0.06] blur-3xl" />
    </div>
    <canvas ref="canvas" class="absolute inset-0 size-full" />
  </div>
</template>
