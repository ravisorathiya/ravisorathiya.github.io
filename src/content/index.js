// Site content loaded from Markdown files in /content (see docs/SITE_PLAN.md §3).
// Each .md compiles to a Vue component (the body) that also exports its
// frontmatter. Validation happens at build time (scripts/content-fs.mjs).
import { slugFromPath } from './schema-lite'

const play = (id) => `https://play.google.com/store/apps/details?id=${id}`
const STATUS_ORDER = { 'in-progress': 0, live: 1, completed: 2 }

// unplugin-vue-markdown exports each frontmatter key as a named export.
const frontmatterOf = ({ default: _body, ...fields }) => fields

const projectModules = import.meta.glob('/content/projects/*.md', { eager: true })
const postModules = import.meta.glob('/content/blog/*.md', { eager: true })

export const projects = Object.entries(projectModules)
  .map(([path, mod]) => {
    const fm = frontmatterOf(mod)
    return {
      slug: slugFromPath(path),
      featured: false,
      order: 100,
      icon: '',
      screenshots: [],
      ...fm,
      playUrl: fm.playPackage ? play(fm.playPackage) : undefined,
      Body: mod.default,
    }
  })
  .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.order - b.order)

// Drafts show in dev, or in a local preview build with VITE_DRAFTS=1 (never in CI).
const showDrafts = import.meta.env.DEV || import.meta.env.VITE_DRAFTS === '1'

export const posts = Object.entries(postModules)
  .map(([path, mod]) => ({
    slug: slugFromPath(path),
    tags: [],
    relatedProjects: [],
    ...frontmatterOf(mod),
    date: String(mod.date).slice(0, 10),
    Body: mod.default,
  }))
  .filter((p) => showDrafts || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

// Home-page code showcase (content/snippets): each body is a Shiki-highlighted block.
const snippetModules = import.meta.glob('/content/snippets/*.md', { eager: true })

export const snippets = Object.entries(snippetModules)
  .map(([path, mod]) => ({ slug: slugFromPath(path), order: 100, notes: [], relatedProjects: [], ...frontmatterOf(mod), Body: mod.default }))
  .sort((a, b) => a.order - b.order)

export const types =[...new Set(projects.map((p) => p.type))]
export const postTags = [...new Set(posts.flatMap((p) => p.tags))].sort()

export const getProject = (slug) => projects.find((p) => p.slug === slug)
export const getPost = (slug) => posts.find((p) => p.slug === slug)
