// Writes dist/blog/rss.xml (RSS 2.0) and dist/blog/atom.xml for published posts.
import { mkdirSync, writeFileSync } from 'node:fs'
import { Feed } from 'feed'

export function writeFeeds(posts, { siteUrl, author, outDir = 'dist' }) {
  if (!posts.length) return 0
  const feed = new Feed({
    title: `${author} — Dev Notes`,
    description: `Articles by ${author} on Android development: Kotlin, Jetpack Compose and shipping apps to Google Play.`,
    id: `${siteUrl}/blog`,
    link: `${siteUrl}/blog`,
    language: 'en',
    image: `${siteUrl}/og/default.png`,
    favicon: `${siteUrl}/favicon-96.png`,
    copyright: `© ${new Date().getFullYear()} ${author}`,
    updated: new Date(posts[0].updated ?? posts[0].date),
    feedLinks: { rss: `${siteUrl}/blog/rss.xml`, atom: `${siteUrl}/blog/atom.xml` },
    author: { name: author, link: `${siteUrl}/` },
  })
  for (const p of posts) {
    const url = `${siteUrl}/blog/${p.slug}`
    feed.addItem({
      title: p.title,
      id: url,
      link: url,
      description: p.description,
      date: new Date(p.updated ?? p.date),
      published: new Date(p.date),
      category: p.tags.map((name) => ({ name })),
      author: [{ name: author, link: `${siteUrl}/` }],
      image: `${siteUrl}/og/blog/${p.slug}.png`,
    })
  }
  mkdirSync(`${outDir}/blog`, { recursive: true })
  writeFileSync(`${outDir}/blog/rss.xml`, feed.rss2())
  writeFileSync(`${outDir}/blog/atom.xml`, feed.atom1())
  return posts.length
}
