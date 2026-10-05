import { computed, toValue } from 'vue'
import { useHead } from '@unhead/vue'
import { experience, posts, profile, SITE_URL, socials } from '../data/portfolio'

// Generated at build time by scripts/og.mjs.
const DEFAULT_IMAGE = `${SITE_URL}/og/default.png`

export const personSchema = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: profile.name,
  jobTitle: profile.role,
  url: `${SITE_URL}/`,
  image: DEFAULT_IMAGE,
  description: profile.shortBio,
  email: `mailto:${profile.email}`,
  worksFor: experience.filter((e) => !e.end).map((e) => ({ '@type': 'Organization', name: e.company })),
  knowsAbout: ['Android development', 'Kotlin', 'Jetpack Compose', 'Clean Architecture', 'Firebase', 'Google Play'],
  sameAs: socials.map((s) => s.url),
}

/**
 * Per-page SEO: title, description, canonical URL, Open Graph, Twitter card
 * and optional JSON-LD. Arguments may be plain values, refs or getters.
 */
export function useSeo({ title, description, path = '/', image, type = 'website', jsonLd, noindex = false, publishedTime }) {
  const url = computed(() => SITE_URL + toValue(path))
  const fullTitle = computed(() => {
    const t = toValue(title)
    return t ? `${t} | ${profile.name}` : `${profile.name} — ${profile.role} | Kotlin & Jetpack Compose Apps`
  })
  const desc = computed(() => toValue(description) ?? profile.shortBio)
  const img = computed(() => {
    const i = toValue(image)
    return i ? (i.startsWith('http') ? i : SITE_URL + i) : DEFAULT_IMAGE
  })

  useHead({
    title: fullTitle,
    link: [
      { rel: 'canonical', href: url },
      ...(posts.some((p) => !p.draft)
        ? [{ rel: 'alternate', type: 'application/rss+xml', title: `${profile.name} — Dev Notes`, href: `${SITE_URL}/blog/rss.xml` }]
        : []),
    ],
    meta: [
      { name: 'description', content: desc },
      { name: 'author', content: profile.name },
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: `${profile.name} — Portfolio` },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:image', content: img },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: img },
      ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }, { property: 'article:author', content: profile.name }] : []),
    ],
    script: jsonLd
      ? [
          {
            type: 'application/ld+json',
            innerHTML: computed(() => JSON.stringify({ '@context': 'https://schema.org', '@graph': toValue(jsonLd) })),
          },
        ]
      : [],
  })
}
