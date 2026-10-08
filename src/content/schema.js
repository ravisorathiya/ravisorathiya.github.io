// Content schemas (zod). Used at build/check time by vite.config.js and
// scripts/check-content.mjs. Rules mirror docs/SITE_PLAN.md §3.
import { z } from 'zod'

export const PROJECT_TYPES = ['Messaging', 'Dialer & Contacts', 'Gallery & Media', 'Productivity', 'Social']
export const PROJECT_STATUSES = ['live', 'completed', 'in-progress']

const imagePath = z.string().regex(/^\/images\/.+\.(png|webp|jpg|jpeg|svg)$/, 'must be a /images/... path')

export const projectSchema = z
  .object({
    title: z.string().min(1),
    type: z.enum(PROJECT_TYPES),
    status: z.enum(PROJECT_STATUSES),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
    icon: imagePath.or(z.literal('')).default(''),
    playPackage: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/, 'must be an applicationId').optional(),
    // Google Play developer (Play Console) account that publishes the app.
    developer: z.string().min(1).optional(),
    developerUrl: z.string().url().startsWith('https://play.google.com/store/apps/').optional(),
    summary: z.string().min(10).max(110, 'summary should be ≤ 110 characters'),
    features: z.array(z.string().min(3)).min(3).max(10),
    highlights: z.array(z.string().min(3)).min(2).max(8),
    tags: z.array(z.string().min(1)).min(3).max(12),
    basedOn: z.string().optional(),
    variants: z.string().optional(),
    screenshots: z
      .array(z.object({ src: imagePath, alt: z.string().min(1), width: z.number().int().positive().optional(), height: z.number().int().positive().optional() }).strict())
      .default([]),
  })
  .strict()
  .refine((p) => p.status !== 'live' || p.playPackage, { message: 'live apps need playPackage', path: ['playPackage'] })

export const postSchema = z
  .object({
    title: z.string().min(5).max(100),
    description: z.string().min(30).max(170, 'description should be ≤ 170 characters (SEO)'),
    date: z.union([z.string(), z.date()]).transform((d) => new Date(d).toISOString().slice(0, 10)),
    updated: z.union([z.string(), z.date()]).transform((d) => new Date(d).toISOString().slice(0, 10)).optional(),
    tags: z.array(z.string()).min(1).max(8),
    relatedProjects: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  })
  .strict()

// Home-page code showcase: one tab = one short, simplified Kotlin snippet.
export const SNIPPET_PREVIEWS = ['compose-filter']

export const snippetSchema = z
  .object({
    title: z.string().min(1).max(30),
    file: z.string().min(1),
    caption: z.string().min(10).max(140, 'caption should be ≤ 140 characters'),
    order: z.number().int().default(100),
    relatedProjects: z.array(z.string()).min(1).max(4),
    // An interactive mock of the code's result (see src/components/showcase/).
    preview: z.enum(SNIPPET_PREVIEWS).optional(),
    // Tappable explanations, keyed to 1-based line numbers of the code block.
    notes: z.array(z.object({ line: z.number().int().positive(), text: z.string().min(10).max(160) }).strict()).max(6).default([]),
  })
  .strict()

export { slugFromPath } from './schema-lite.js'
