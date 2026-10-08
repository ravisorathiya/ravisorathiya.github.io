import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import anchor from 'markdown-it-anchor'
import Shiki from '@shikijs/markdown-it'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { SITE_URL } from './src/data/site.js'
import { loadAllOrThrow } from './scripts/content-fs.mjs'
import { writeFeeds } from './scripts/rss.mjs'
import { generateOgImages } from './scripts/og.mjs'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig(({ command }) => {
  // Validates every Markdown file; a bad frontmatter field fails the build.
  const includeDrafts = command === 'serve' || process.env.VITE_DRAFTS === '1'
  const { projects, posts } = loadAllOrThrow({ includeDrafts })
  const pages = [
    '/',
    '/about',
    '/projects',
    '/contact',
    ...projects.map((p) => `/projects/${p.slug}`),
    ...(posts.length ? ['/blog', ...posts.map((p) => `/blog/${p.slug}`)] : []),
  ]

  return {
    // User site (<user>.github.io) is served from the root, so base is '/'.
    base: '/',
    plugins: [
      // Draft posts must never reach the public bundle: in production builds the
      // file is replaced by a stub that only says "draft: true" (filtered out later).
      {
        name: 'strip-draft-posts',
        enforce: 'pre',
        load(id) {
          if (includeDrafts || !/[\\/]content[\\/]blog[\\/][^\\/]+\.md(\?|$)/.test(id)) return
          const file = id.split('?')[0]
          if (!matter(readFileSync(file, 'utf8')).data.draft) return
          return id.includes('?raw') ? 'export default ""' : '---\ndraft: true\ndate: 1970-01-01\n---\n'
        },
      },
      vue({ include: [/\.vue$/, /\.md$/] }),
      Markdown({
        headEnabled: false, // per-page <head> is handled by useSeo()
        wrapperClasses: 'markdown-body',
        frontmatterPreprocess(frontmatter, _options, id) {
          // Reading time for blog posts, computed from the raw Markdown.
          if (/[\\/]content[\\/]blog[\\/]/.test(id)) {
            const { content } = matter(readFileSync(id, 'utf8'))
            frontmatter.readingTime = Math.max(1, Math.round(readingTime(content).minutes))
          }
          return { head: {}, frontmatter }
        },
        async markdownItSetup(md) {
          md.use(anchor, { permalink: anchor.permalink.headerLink(), slugify: (s) => s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') })
          md.use(await Shiki({ themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false }))
          // Open external links in a new tab.
          const defaultLinkOpen = md.renderer.rules.link_open ?? ((t, i, o, e, self) => self.renderToken(t, i, o))
          md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
            const href = tokens[idx].attrGet('href') ?? ''
            if (/^https?:\/\//.test(href)) {
              tokens[idx].attrSet('target', '_blank')
              tokens[idx].attrSet('rel', 'noopener')
            }
            return defaultLinkOpen(tokens, idx, options, env, self)
          }
        },
      }),
      tailwindcss(),
      // Re-compresses images copied from public/ (screenshots, icons, og.png).
      { ...ViteImageOptimizer({ png: { quality: 82 }, jpeg: { quality: 82 }, webp: { quality: 82 }, svg: { multipass: true } }), apply: (_, env) => env.command === 'build' && !env.isSsrBuild },
      VitePWA({
        // New service workers activate silently (skipWaiting + clientsClaim) without
        // reloading the page: HTML is network-first and assets are hashed, so a
        // forced reload after each deploy would only interrupt visitors.
        registerType: 'prompt',
        injectRegister: null, // registered from src/main.js on the client only
        includeAssets: ['favicon.ico', 'favicon-96.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Ravi Sorathiya — Android Developer',
          short_name: 'Ravi.dev',
          description: 'Android apps by Ravi Sorathiya: Kotlin & Jetpack Compose, live on Google Play.',
          theme_color: '#059669',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Pre-rendered pages are generated after this plugin runs, so HTML is
          // cached at runtime (network-first = new deploys show immediately).
          globPatterns: ['**/*.{js,css,svg,woff2}'],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            { urlPattern: ({ request }) => request.mode === 'navigate', handler: 'NetworkFirst', options: { cacheName: 'pages', networkTimeoutSeconds: 4 } },
            { urlPattern: /\/images\/.*\.(webp|png|jpg|svg)$/, handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } } },
            { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, handler: 'StaleWhileRevalidate', options: { cacheName: 'fonts' } },
          ],
        },
      }),
    ],
    ssgOptions: {
      // flat: /about -> about.html, which GitHub Pages serves at /about with a 200.
      dirStyle: 'flat',
      formatting: 'minify',
      // '/404' renders the catch-all route into 404.html for unknown URLs.
      includedRoutes: () => [...pages, '/404'],
      async onFinished() {
        const today = new Date().toISOString().slice(0, 10)
        const lastmod = (p) => posts.find((x) => p === `/blog/${x.slug}`)?.updated ?? posts.find((x) => p === `/blog/${x.slug}`)?.date ?? today
        const priority = (p) =>
          p === '/' ? '1.0' : p === '/projects' || p === '/blog' ? '0.9' : /^\/(projects|blog)\//.test(p) ? '0.8' : '0.6'
        const urls = pages
          .map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${lastmod(p)}</lastmod><priority>${priority(p)}</priority></url>`)
          .join('\n')
        writeFileSync(
          'dist/sitemap.xml',
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        )
        console.log(`sitemap.xml: ${pages.length} URLs`)
        const feedCount = writeFeeds(posts, { siteUrl: SITE_URL, author: 'Ravi Sorathiya' })
        if (feedCount) console.log(`blog/rss.xml + atom.xml: ${feedCount} posts`)
        console.log(`og: ${await generateOgImages({ projects, posts })} share images`)
      },
    },
  }
})
