// Full-text search (MiniSearch) over pages, apps, blog posts and their individual
// `##` sections, used by the Ctrl+K palette and the Projects page. The index and the
// raw Markdown bodies are loaded lazily on first search, so none of it is in the main bundle.
import { education, experience, nav, posts, profile, projects, skills, socials } from '../data/portfolio'

const projectRaw = import.meta.glob('/content/projects/*.md', { query: '?raw', import: 'default' })
const postRaw = import.meta.glob('/content/blog/*.md', { query: '?raw', import: 'default' })

// Plain text from Markdown: drop frontmatter, code fences, markup.
const plain = (md) =>
  md
    .replace(/^---[\s\S]*?---/, '')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<\/?[A-Z][\w-]*[^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Same slug rule as markdown-it-anchor in vite.config.js, so section links land on the heading.
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

/** Split a Markdown body into its `## ` sections (ignoring `##` inside code fences). */
function sections(md) {
  const body = md.replace(/^---[\s\S]*?---/, '').replace(/<script[\s\S]*?<\/script>/g, '')
  const out = []
  let fence = false
  let current = null
  for (const line of body.split('\n')) {
    if (line.trimStart().startsWith('```')) fence = !fence
    const h = !fence && line.match(/^## (.+)/)
    if (h) {
      const heading = plain(h[1])
      current = { heading, anchor: slugify(heading), lines: [] }
      out.push(current)
    } else current?.lines.push(line)
  }
  return out.map((s) => ({ ...s, text: plain(s.lines.join('\n')) }))
}

// Words people use for the same thing. Each query word also matches its synonyms.
const SYNONYMS = [
  ['sms', 'message', 'messaging', 'messenger', 'text', 'texting', 'mms', 'chat'],
  ['dialer', 'phone', 'call', 'calling', 'caller', 'telephony', 'incallservice'],
  ['contact', 'phonebook', 'address'],
  ['photo', 'gallery', 'picture', 'image', 'album'],
  ['video', 'media', 'player', 'exoplayer', 'media3'],
  ['pdf', 'document', 'pdfjs'],
  ['alarm', 'wake', 'clock', 'timer', 'stopwatch'],
  ['calendar', 'event', 'holiday', 'schedule'],
  ['compose', 'jetpack'],
  ['spam', 'block', 'blocking', 'screening', 'callscreeningservice'],
  ['lock', 'vault', 'private', 'locker', 'biometric', 'password'],
  ['music', 'audio', 'song', 'sound'],
  ['record', 'recorder', 'voice', 'recording'],
  ['ads', 'admob', 'monetization'],
  ['ai', 'claude', 'agent', 'llm'],
  ['hire', 'contact', 'email', 'freelance'],
  ['resume', 'cv', 'experience', 'career', 'job'],
  ['database', 'room', 'sqlite', 'realm'],
  ['hilt', 'dagger', 'injection'],
]

// Lowercase, strip accents and a plural "s", identically at index and query time.
function processTerm(term) {
  const t = term.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1)
  return t
}
const synonymsOf = new Map()
for (const group of SYNONYMS) {
  const g = group.map(processTerm)
  for (const w of g) synonymsOf.set(w, [...new Set([...(synonymsOf.get(w) ?? []), ...g.filter((x) => x !== w)])])
}

const rawFor = (globs, kind, slug) => globs[`/content/${kind}/${slug}.md`]?.() ?? Promise.resolve('')

// Real text for the static pages, so "Hilt", "MCA" or "Instagram" find the right page.
const pageText = {
  '/': [profile.tagline, profile.shortBio].join(' '),
  '/about': [
    ...profile.bio,
    ...skills.flatMap((g) => [g.group, ...g.items]),
    ...experience.flatMap((e) => [e.role, e.company, e.description, ...e.tags]),
    ...education.flatMap((e) => [e.degree, e.short]),
  ].join(' '),
  '/projects': projects.map((p) => `${p.title} ${p.type}`).join(' '),
  '/blog': posts.map((p) => p.title).join(' '),
  '/contact': ['email hire contact message', profile.email, ...socials.map((s) => s.name)].join(' '),
}

let indexPromise
function getIndex() {
  indexPromise ??= (async () => {
    const { default: MiniSearch } = await import('minisearch')
    const docs = nav.map((n) => ({
      id: `page:${n.to}`,
      kind: 'page',
      title: n.label,
      keywords: 'page',
      summary: '',
      text: pageText[n.to] ?? '',
      to: n.to,
    }))

    for (const p of projects) {
      const raw = await rawFor(projectRaw, 'projects', p.slug)
      const base = `/projects/${p.slug}`
      docs.push({
        id: `app:${p.slug}`,
        kind: 'app',
        slug: p.slug,
        title: p.title,
        keywords: [p.slug.replace(/-/g, ' '), p.type, ...p.tags].join(' '),
        summary: p.summary,
        text: [...p.features, ...p.highlights, plain(raw)].join(' '),
        to: base,
      })
      for (const s of sections(raw))
        docs.push({ id: `section:${base}#${s.anchor}`, kind: 'section', parent: 'app', slug: p.slug, parentTitle: p.title, title: s.heading, keywords: '', summary: '', text: s.text, to: `${base}#${s.anchor}` })
    }

    for (const p of posts) {
      const raw = await rawFor(postRaw, 'blog', p.slug)
      const base = `/blog/${p.slug}`
      docs.push({
        id: `post:${p.slug}`,
        kind: 'post',
        slug: p.slug,
        title: p.title,
        keywords: p.tags.join(' '),
        summary: p.description,
        text: plain(raw),
        to: base,
      })
      for (const s of sections(raw))
        docs.push({ id: `section:${base}#${s.anchor}`, kind: 'section', parent: 'post', slug: p.slug, parentTitle: p.title, title: s.heading, keywords: '', summary: '', text: s.text, to: `${base}#${s.anchor}` })
    }

    const ms = new MiniSearch({
      fields: ['title', 'keywords', 'summary', 'text'],
      storeFields: ['kind', 'parent', 'slug', 'parentTitle', 'title', 'summary', 'text', 'to'],
      processTerm,
      searchOptions: {
        boost: { title: 4, keywords: 2, summary: 1.5 },
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
        // Whole documents outrank their own sections.
        boostDocument: (_id, _term, stored) => (stored?.kind === 'section' ? 0.6 : 1),
      },
    })
    ms.addAll(docs)
    return ms
  })()
  return indexPromise
}

/** Query tree: every word must match (AND), but a word may match through any of its synonyms (OR). */
const words = (q) => q.split(/[\s,.;:!?/()"']+/).filter(Boolean)

function queryTree(q, combineWith) {
  return {
    combineWith,
    queries: words(q).map((w) => {
      const syn = synonymsOf.get(processTerm(w)) ?? []
      // Synonyms only match whole words (no prefix/fuzzy) so they widen recall without adding noise.
      return syn.length ? { combineWith: 'OR', queries: [w, { combineWith: 'OR', queries: syn, prefix: false, fuzzy: false }] } : w
    }),
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Split text into [{ text, match }] parts so matched words can be highlighted safely (no v-html). */
export function highlight(text, terms) {
  if (!text || !terms?.length) return [{ text: text ?? '', match: false }]
  const re = new RegExp(`\\b(${terms.map(escapeRe).sort((a, b) => b.length - a.length).join('|')})\\w*`, 'gi')
  const parts = []
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false })
    parts.push({ text: m[0], match: true })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false })
  return parts
}

/** Short text around the first matched term, for result previews. */
function snippet(hit) {
  const source = hit.summary || ''
  const body = hit.text || ''
  const lower = (s) => s.toLowerCase()
  if (source && hit.terms.some((t) => lower(source).includes(t))) return source
  const i = Math.min(...hit.terms.map((t) => lower(body).indexOf(t)).filter((n) => n >= 0))
  if (!Number.isFinite(i)) return source || body.slice(0, 120)
  const start = Math.max(0, body.lastIndexOf(' ', Math.max(0, i - 50)))
  return (start ? '…' : '') + body.slice(start, i + 100).trim() + '…'
}

/**
 * @param {string} query
 * @param {{ kind?: 'page'|'app'|'post'|'section' }} [opts]
 * @returns {Promise<Array<{ id, kind, parent, slug, parentTitle, title, to, snippet, terms, score }>>}
 */
export async function search(query, { kind } = {}) {
  const q = query.trim()
  if (!q) return []
  const ms = await getIndex()
  const filter = kind ? (r) => r.kind === kind : undefined
  // Words the visitor typed count fully; matches found only through a synonym count less.
  const typed = new Set(words(q).map(processTerm))
  const boostTerm = (term) => (typed.has(term) ? 1 : 0.35)
  let hits = ms.search(queryTree(q, 'AND'), { filter, boostTerm })
  // Fall back to OR when no document matches every word.
  if (!hits.length) hits = ms.search(queryTree(q, 'OR'), { filter, boostTerm })

  // An exact phrase in the title is the strongest signal of intent.
  const phrase = q.toLowerCase()
  for (const h of hits) if (h.title.toLowerCase().includes(phrase)) h.score *= 2
  hits.sort((a, b) => b.score - a.score)

  // Keep the list focused: at most the 6 best-matching sections.
  let sectionCount = 0
  hits = hits.filter((h) => h.kind !== 'section' || ++sectionCount <= 6)

  return hits.map((h) => ({
    id: h.id,
    kind: h.kind,
    parent: h.parent,
    slug: h.slug,
    parentTitle: h.parentTitle,
    title: h.title,
    to: h.to,
    snippet: snippet(h),
    terms: h.terms,
    score: h.score,
  }))
}

/** Warm the index (e.g. when the palette opens) so the first keystroke is instant. */
export const preloadSearch = () => void getIndex()
