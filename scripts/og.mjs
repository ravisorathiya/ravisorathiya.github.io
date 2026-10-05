// Generates 1200×630 Open Graph share images at build time with satori + resvg:
//   dist/og/default.png, dist/og/projects/<slug>.png, dist/og/blog/<slug>.png
// Run automatically from vite.config.js (ssgOptions.onFinished), or standalone:
//   node scripts/og.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { loadAllOrThrow, ROOT_DIR } from './content-fs.mjs'

const W = 1200
const H = 630
const font = (w) => readFileSync(join(ROOT_DIR, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff`))
const fonts = [
  { name: 'Inter', data: font(400), weight: 400, style: 'normal' },
  { name: 'Inter', data: font(600), weight: 600, style: 'normal' },
  { name: 'Inter', data: font(800), weight: 800, style: 'normal' },
]

// Tiny hyperscript for satori's element tree.
const h = (type, style = {}, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c != null && c !== false) } })
const img = (src, style) => ({ type: 'img', props: { src, style } })

// satori can't decode WebP, so every icon goes through sharp → PNG data URI.
const iconCache = new Map()
async function icon(path, size = 256) {
  if (!path) return null
  if (!iconCache.has(path)) {
    const buf = await sharp(join(ROOT_DIR, 'public', path)).resize(size, size).png().toBuffer()
    iconCache.set(path, `data:image/png;base64,${buf.toString('base64')}`)
  }
  return iconCache.get(path)
}

const STATUS = { live: ['Live on Google Play', '#34d399'], completed: ['Completed', '#7dd3fc'], 'in-progress': ['In progress', '#fbbf24'] }

const frame = (...children) =>
  h(
    'div',
    {
      width: W,
      height: H,
      position: 'relative',
      fontFamily: 'Inter',
      color: '#fff',
      backgroundColor: '#022c22',
      backgroundImage: 'linear-gradient(135deg, #065f46 0%, #022c22 55%, #042f2e 100%)',
      padding: 72,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    h('div', { position: 'absolute', top: -160, left: -120, width: 520, height: 520, borderRadius: 9999, backgroundColor: 'rgba(16,185,129,0.28)', filter: 'blur(80px)' }),
    h('div', { position: 'absolute', bottom: -200, right: -120, width: 560, height: 560, borderRadius: 9999, backgroundColor: 'rgba(13,148,136,0.30)', filter: 'blur(90px)' }),
    ...children,
  )

const footer = (right) =>
  h(
    'div',
    { alignItems: 'center', justifyContent: 'space-between', fontSize: 24, color: '#a7f3d0' },
    h('div', { alignItems: 'center', gap: 14 },
      h('div', { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(135deg,#10b981,#22c55e,#0d9488)', fontWeight: 800, fontSize: 18, color: '#fff' }, 'RS'),
      h('div', { fontWeight: 600, color: '#fff' }, 'Ravi Sorathiya'),
      h('div', { color: '#6ee7b7' }, '· ravisorathiya.github.io'),
    ),
    right ? h('div', { color: '#6ee7b7' }, right) : null,
  )

const pill = (text, color) =>
  h('div', { alignSelf: 'flex-start', padding: '8px 20px', borderRadius: 9999, border: `2px solid ${color}66`, color, fontSize: 22, fontWeight: 600 }, text)

async function projectCard(p) {
  const [label, color] = STATUS[p.status]
  const src = await icon(p.icon)
  return frame(
    h('div', { alignItems: 'center', gap: 48, marginTop: 10 },
      src
        ? img(src, { width: 200, height: 200, borderRadius: 48, boxShadow: '0 24px 60px rgba(0,0,0,0.45)' })
        : h('div', { width: 200, height: 200, borderRadius: 48, alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, backgroundImage: 'linear-gradient(135deg,#10b981,#0d9488)' }, p.title[0]),
      h('div', { flexDirection: 'column', gap: 18, flex: 1 },
        h('div', { gap: 14 }, pill(label, color), pill(p.type, '#a7f3d0')),
        h('div', { flexDirection: 'column', gap: 6 },
          h('div', { fontSize: p.title.length > 22 ? 64 : 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }, p.title),
          p.developer ? h('div', { fontSize: 26, color: '#6ee7b7', fontWeight: 600 }, `by ${p.developer}`) : null,
        ),
        h('div', { fontSize: 28, color: '#d1fae5', lineHeight: 1.35 }, p.summary),
      ),
    ),
    h('div', { gap: 12 }, p.tags.slice(0, 5).map((t) => h('div', { padding: '6px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', fontSize: 22, color: '#a7f3d0' }, t))),
    footer('Android app'),
  )
}

function postCard(p) {
  const date = new Date(p.date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
  return frame(
    h('div', { flexDirection: 'column', gap: 26 },
      h('div', { gap: 14 }, pill('Dev Notes', '#34d399'), pill(`${p.readingTime} min read`, '#a7f3d0')),
      h('div', { fontSize: p.title.length > 60 ? 58 : 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.08, maxWidth: 1000 }, p.title),
      h('div', { gap: 12 }, p.tags.slice(0, 4).map((t) => h('div', { fontSize: 24, color: '#6ee7b7' }, `#${t}`))),
    ),
    footer(date),
  )
}

async function defaultCard(projects) {
  const live = projects.filter((p) => p.status === 'live')
  const icons = await Promise.all(projects.filter((p) => p.icon).slice(0, 9).map((p) => icon(p.icon, 160)))
  return frame(
    h('div', { justifyContent: 'space-between', alignItems: 'center', height: '100%' },
      h('div', { flexDirection: 'column', gap: 22, maxWidth: 620 },
        pill('Android Developer · Kotlin & Compose', '#6ee7b7'),
        h('div', { flexDirection: 'column', fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1 },
          h('div', {}, 'Ravi'),
          h('div', { color: '#34d399' }, 'Sorathiya'),
        ),
        h('div', { fontSize: 30, color: '#a7f3d0', lineHeight: 1.35 }, `${live.length} apps live on Google Play: dialers, SMS, galleries, calendar & a PDF editor`),
        h('div', { fontSize: 24, color: '#6ee7b7' }, 'ravisorathiya.github.io'),
      ),
      h('div', { flexWrap: 'wrap', width: 3 * 118 + 2 * 22, gap: 22, transform: 'rotate(-6deg)' },
        icons.map((src) => img(src, { width: 118, height: 118, borderRadius: 28, boxShadow: '0 18px 40px rgba(0,0,0,0.5)' })),
      ),
    ),
  )
}

async function render(tree, outFile) {
  const svg = await satori(tree, { width: W, height: H, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
  writeFileSync(outFile, png)
}

/** Generates all share images into `${outDir}/og`. Returns the number written. */
export async function generateOgImages({ projects, posts, outDir = join(ROOT_DIR, 'dist') }) {
  mkdirSync(join(outDir, 'og/projects'), { recursive: true })
  mkdirSync(join(outDir, 'og/blog'), { recursive: true })
  await render(await defaultCard(projects), join(outDir, 'og/default.png'))
  for (const p of projects) await render(await projectCard(p), join(outDir, `og/projects/${p.slug}.png`))
  for (const p of posts) await render(postCard(p), join(outDir, `og/blog/${p.slug}.png`))
  return 1 + projects.length + posts.length
}

// Standalone: node scripts/og.mjs [--drafts]
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { projects, posts } = loadAllOrThrow({ includeDrafts: process.argv.includes('--drafts') })
  const n = await generateOgImages({ projects, posts })
  // Keep the README banner (public/og.png) in sync with the generated default card.
  writeFileSync(join(ROOT_DIR, 'public/og.png'), readFileSync(join(ROOT_DIR, 'dist/og/default.png')))
  console.log(`og: ${n} images (+ public/og.png)`)
}
