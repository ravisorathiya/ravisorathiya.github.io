// `npm run check` (also runs in CI before every deploy).
// Validates all Markdown content against the zod schemas, keeps the
// docs/PROJECTS.md registry in sync with content/projects, and checks
// files, references and secrets. Rules: docs/SITE_PLAN.md §3.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadPosts, loadProjects, loadSnippets, ROOT_DIR } from './content-fs.mjs'

const errors = []
const warn = []
const at = (p) => join(ROOT_DIR, p)

const { items: projects, errors: projectErrors } = loadProjects()
const { items: posts, errors: postErrors } = loadPosts({ includeDrafts: true })
const { items: snippets, errors: snippetErrors } = loadSnippets()
errors.push(...projectErrors, ...postErrors, ...snippetErrors)

// ── Registry (docs/PROJECTS.md) ↔ content/projects ────────
const md = readFileSync(at('docs/PROJECTS.md'), 'utf8')
const block = md.match(/<!-- registry:start[^>]*-->([\s\S]*?)<!-- registry:end -->/)
if (!block) errors.push('docs/PROJECTS.md: registry markers not found')
const rows = (block?.[1] ?? '')
  .split('\n')
  .filter((l) => l.trim().startsWith('|') && !/^\|\s*(Slug|---)/.test(l.trim()))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([slug, title, status, type, featured, pkg]) => ({ slug, title, status, type, featured: featured === 'yes', pkg: pkg === '—' ? '' : pkg }))

const bySlug = new Map(projects.map((p) => [p.slug, p]))
for (const r of rows) {
  const p = bySlug.get(r.slug)
  if (!p) { errors.push(`${r.slug}: in PROJECTS.md registry but content/projects/${r.slug}.md is missing`); continue }
  for (const [k, a, b] of [['title', r.title, p.title], ['status', r.status, p.status], ['type', r.type, p.type], ['featured', r.featured, !!p.featured], ['Play package', r.pkg, p.playPackage ?? '']])
    if (a !== b) errors.push(`${r.slug}: ${k} differs (registry "${a}" vs content "${b}")`)
}
const regSlugs = new Set(rows.map((r) => r.slug))
for (const p of projects) if (!regSlugs.has(p.slug)) errors.push(`${p.slug}: content/projects/${p.slug}.md is not in the PROJECTS.md registry`)

// ── Files & references ─────────────────────────────────────
for (const p of projects) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${p.slug}: file name must be kebab-case`)
  if (p.icon && !existsSync(at(`public${p.icon}`))) errors.push(`${p.slug}: icon not found: public${p.icon}`)
  if (!p.icon) warn.push(`${p.slug}: no icon (a gradient letter tile is shown)`)
  for (const s of p.screenshots ?? []) if (!existsSync(at(`public${s.src}`))) errors.push(`${p.slug}: screenshot not found: public${s.src}`)
  if (p.status === 'live' && !p.screenshots?.length) warn.push(`${p.slug}: live app without screenshots (run npm run screenshots -- ${p.slug})`)
  if (p.status === 'live' && !p.developer) warn.push(`${p.slug}: live app without developer (run npm run play-meta -- ${p.slug})`)
  if (p.body.trim().length < 80) warn.push(`${p.slug}: case study body is very short`)
}
const featured = projects.filter((p) => p.featured).length
if (featured !== 4) warn.push(`${featured} featured projects (home page layout expects 4)`)

for (const p of posts) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`blog/${p.slug}: file name must be kebab-case`)
  for (const r of p.relatedProjects) if (!bySlug.has(r)) errors.push(`blog/${p.slug}: relatedProjects "${r}" does not exist`)
  if (p.draft) warn.push(`blog/${p.slug}: draft (not published)`)
}

// Home-page code snippets: one Kotlin block each, notes point at real lines.
for (const s of snippets) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) errors.push(`snippets/${s.slug}: file name must be kebab-case`)
  for (const r of s.relatedProjects) if (!bySlug.has(r)) errors.push(`snippets/${s.slug}: relatedProjects "${r}" does not exist`)
  const blocks = [...s.body.replace(/\r\n/g, '\n').matchAll(/```kotlin\n([\s\S]*?)\n```/g)]
  if (blocks.length !== 1) { errors.push(`snippets/${s.slug}: body must be exactly one kotlin code block`); continue }
  const lines = blocks[0][1].split('\n').length
  if (lines > 30) warn.push(`snippets/${s.slug}: ${lines} lines; keep snippets short (≤ 30)`)
  for (const n of s.notes) if (n.line > lines) errors.push(`snippets/${s.slug}: note on line ${n.line} but the code has ${lines} lines`)
}

// ── Blog registry (docs/POSTS.md) ↔ content/blog ──────────
const postsMd = readFileSync(at('docs/POSTS.md'), 'utf8')
const postsBlock = postsMd.match(/<!-- posts:start[^>]*-->([\s\S]*?)<!-- posts:end -->/)
if (!postsBlock) errors.push('docs/POSTS.md: registry markers not found')
const postRows = (postsBlock?.[1] ?? '')
  .split('\n')
  .filter((l) => l.trim().startsWith('|') && !/^\|\s*(Slug|---)/.test(l.trim()))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([slug, title, status, date]) => ({ slug, title, status, date }))
const postBySlug = new Map(posts.map((p) => [p.slug, p]))
for (const r of postRows) {
  const p = postBySlug.get(r.slug)
  if (!p) { errors.push(`${r.slug}: in POSTS.md registry but content/blog/${r.slug}.md is missing`); continue }
  const status = p.draft ? 'draft' : 'published'
  for (const [k, a, b] of [['title', r.title, p.title], ['status', r.status, status], ['date', r.date, p.date]])
    if (a !== b) errors.push(`blog/${r.slug}: ${k} differs (POSTS.md "${a}" vs content "${b}")`)
}
const postRegSlugs = new Set(postRows.map((r) => r.slug))
for (const p of posts) if (!postRegSlugs.has(p.slug)) errors.push(`blog/${p.slug}: content/blog/${p.slug}.md is not in the POSTS.md registry`)

// ── No secrets in content ──────────────────────────────────
const SECRETS = [[/ca-app-pub-\d+/, 'AdMob ad unit ID'], [/AIza[0-9A-Za-z_-]{20,}/, 'Google API key'], [/storePassword|keyPassword|storeFile\s*=/, 'keystore detail']]
for (const item of [...projects.map((p) => ['projects', p]), ...posts.map((p) => ['blog', p]), ...snippets.map((p) => ['snippets', p])]) {
  const raw = readFileSync(item[1].file, 'utf8')
  for (const [re, what] of SECRETS) if (re.test(raw)) errors.push(`content/${item[0]}/${item[1].slug}.md contains a ${what}; remove it`)
}

// ── Report ─────────────────────────────────────────────────
for (const w of warn) console.warn(`⚠ ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  console.error(`\n${errors.length} problem(s). See docs/SITE_PLAN.md §3 and docs/PROJECTS.md.`)
  process.exit(1)
}
const count = (s) => projects.filter((p) => p.status === s).length
const published = posts.filter((p) => !p.draft).length
console.log(`✓ ${projects.length} projects in sync (${count('live')} live · ${count('in-progress')} in progress · ${count('completed')} completed) · ${published} published post(s), ${posts.length - published} draft(s) · ${snippets.length} code snippets`)
