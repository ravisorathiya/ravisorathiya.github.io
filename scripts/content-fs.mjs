// Node-side content loader (build, OG images, RSS, checks). Reads the Markdown
// files in content/ with gray-matter and validates them with the zod schemas.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { postSchema, projectSchema, slugFromPath, snippetSchema } from '../src/content/schema.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STATUS_ORDER = { 'in-progress': 0, live: 1, completed: 2 }

function readDir(kind) {
  const dir = join(ROOT, 'content', kind)
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const file = join(dir, f)
      const { data, content } = matter(readFileSync(file, 'utf8'))
      return { slug: slugFromPath(f), file, data, content }
    })
}

function validate(schema, entries, kind) {
  const errors = []
  const items = entries.map((e) => {
    const r = schema.safeParse(e.data)
    if (!r.success) errors.push(...r.error.issues.map((i) => `content/${kind}/${e.slug}.md → ${i.path.join('.') || '(root)'}: ${i.message}`))
    return { ...(r.data ?? e.data), slug: e.slug, body: e.content, file: e.file }
  })
  return { items, errors }
}

/** @returns {{ items: any[], errors: string[] }} */
export function loadProjects() {
  const res = validate(projectSchema, readDir('projects'), 'projects')
  res.items.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.order - b.order)
  return res
}

/** @returns {{ items: any[], errors: string[] }} */
export function loadPosts({ includeDrafts = false } = {}) {
  const res = validate(postSchema, readDir('blog'), 'blog')
  res.items = res.items
    .filter((p) => includeDrafts || !p.draft)
    .map((p) => ({ ...p, readingTime: Math.max(1, Math.round(readingTime(p.body).minutes)) }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return res
}

/** @returns {{ items: any[], errors: string[] }} */
export function loadSnippets() {
  const res = validate(snippetSchema, readDir('snippets'), 'snippets')
  res.items.sort((a, b) => a.order - b.order)
  return res
}

/** Throws with every validation error (used by the build). */
export function loadAllOrThrow(opts) {
  const projects = loadProjects()
  const posts = loadPosts(opts)
  const snippets = loadSnippets()
  const errors = [...projects.errors, ...posts.errors, ...snippets.errors]
  if (errors.length) throw new Error(`Invalid content:\n  ${errors.join('\n  ')}`)
  return { projects: projects.items, posts: posts.items }
}

export const ROOT_DIR = ROOT
