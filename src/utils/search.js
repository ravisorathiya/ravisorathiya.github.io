// Full-text search (MiniSearch) over pages, apps and blog posts, used by the
// Ctrl+K palette and the Projects page. The index and the raw Markdown bodies
// are loaded lazily on first search, so none of it is in the main bundle.
import { nav, posts, projects } from '../data/portfolio'

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

const rawFor = (globs, kind, slug) => globs[`/content/${kind}/${slug}.md`]?.() ?? Promise.resolve('')

let indexPromise
function getIndex() {
  indexPromise ??= (async () => {
    const { default: MiniSearch } = await import('minisearch')
    const docs = [
      ...nav.map((n) => ({ id: `page:${n.to}`, kind: 'page', title: n.label, keywords: 'page', summary: '', text: '', to: n.to })),
      ...(await Promise.all(
        projects.map(async (p) => ({
          id: `app:${p.slug}`,
          kind: 'app',
          slug: p.slug,
          title: p.title,
          keywords: [p.slug.replace(/-/g, ' '), p.type, ...p.tags].join(' '),
          summary: p.summary,
          text: [...p.features, ...p.highlights, plain(await rawFor(projectRaw, 'projects', p.slug))].join(' '),
          to: `/projects/${p.slug}`,
        })),
      )),
      ...(await Promise.all(
        posts.map(async (p) => ({
          id: `post:${p.slug}`,
          kind: 'post',
          slug: p.slug,
          title: p.title,
          keywords: p.tags.join(' '),
          summary: p.description,
          text: plain(await rawFor(postRaw, 'blog', p.slug)),
          to: `/blog/${p.slug}`,
        })),
      )),
    ]
    const ms = new MiniSearch({
      fields: ['title', 'keywords', 'summary', 'text'],
      storeFields: ['kind', 'slug', 'title', 'summary', 'text', 'to'],
      searchOptions: {
        boost: { title: 4, keywords: 2, summary: 1.5 },
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
        combineWith: 'AND',
      },
    })
    ms.addAll(docs)
    return ms
  })()
  return indexPromise
}

/** Short text around the first matched term, for result previews. */
function snippet(hit) {
  const source = hit.summary || ''
  const body = hit.text || ''
  const term = hit.terms[0]
  if (!term || source.toLowerCase().includes(term)) return source
  const i = body.toLowerCase().indexOf(term)
  if (i < 0) return source
  const start = Math.max(0, i - 50)
  return (start ? '…' : '') + body.slice(start, i + 90).trim() + '…'
}

/**
 * @param {string} query
 * @param {{ kind?: 'page'|'app'|'post' }} [opts]
 * @returns {Promise<Array<{ id, kind, slug, title, to, snippet, score }>>}
 */
export async function search(query, { kind } = {}) {
  const q = query.trim()
  if (!q) return []
  const ms = await getIndex()
  let hits = ms.search(q, kind ? { filter: (r) => r.kind === kind } : undefined)
  // Fall back to OR when no document matches every word.
  if (!hits.length) hits = ms.search(q, { combineWith: 'OR', ...(kind && { filter: (r) => r.kind === kind }) })
  return hits.map((h) => ({ id: h.id, kind: h.kind, slug: h.slug, title: h.title, to: h.to, snippet: snippet(h), score: h.score }))
}

/** Warm the index (e.g. when the palette opens) so the first keystroke is instant. */
export const preloadSearch = () => void getIndex()
