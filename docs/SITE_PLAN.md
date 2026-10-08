# Site Plan: ravisorathiya.github.io

> The living plan for Ravi Sorathiya's portfolio. AI agents and humans should read this before changing the site, and update it when a decision changes.
> Live site: **https://ravisorathiya.github.io/** · Repo: https://github.com/ravisorathiya/ravisorathiya.github.io · Agent rules: [`CLAUDE.md`](../CLAUDE.md)

---

## 1. Purpose

Showcase Ravi Sorathiya as an **Android developer (Kotlin, Jetpack Compose)**, centred on the Google Play apps he has shipped, plus technical writing that shows how they're built.

**Primary audiences:** recruiters, clients, other developers.

**Goals, in order:**
1. Prove real shipped work (Google Play apps, screenshots, links).
2. Show technical depth (case studies, Dev Notes articles).
3. Make contact easy.
4. Rank for "Ravi Sorathiya" and for long-tail Android topics, via articles.

---

## 2. Pages

| Route | View | Purpose |
| --- | --- | --- |
| `/` | `HomeView.vue` | Hero + typewriter, count-up stats, phone mockup, icon marquee, featured apps, flagship spotlight, latest notes, CTA |
| `/about` | `AboutView.vue` | Bio, tech explorer (skill → apps), interactive career journey (`CareerJourney.vue`: work + study timeline, linked cards) |
| `/projects` | `ProjectsView.vue` | All apps; full-text search + status/type filters synced to the URL (`?q=&status=&type=`) |
| `/projects/:slug` | `ProjectDetailView.vue` | Screenshot gallery (lightbox), features / under-the-hood tabs, **case study** (Markdown body), tech stack, Google Play badge, related apps |
| `/blog` | `BlogIndexView.vue` | Dev Notes list, tag filter (`?tag=`), RSS link. Exists only when ≥ 1 published post. |
| `/blog/:slug` | `BlogPostView.vue` | Article, table of contents, related apps, older/newer |
| `/contact` | `ContactView.vue` | Email, socials, mailto form |
| `/404` | `NotFoundView.vue` | Not found (`noindex`) |

**Global UI:**
- Sticky nav: the Blog link appears automatically when posts exist
- <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> command palette (full-text over pages, apps, articles)
- Scroll progress bar
- Dark mode

---

## 3. Content model (Markdown)

Content lives in **`content/`**. Each file's frontmatter is validated by zod ([`src/content/schema.js`](../src/content/schema.js)) in `npm run check` and at build time, so a bad file fails CI before it can deploy.

### Projects: `content/projects/<slug>.md`
The file name is the slug and URL (`/projects/<slug>`). **Never rename a published file.**

| Field | Required | Rules |
| --- | --- | --- |
| `title` | ✅ | Public app name as on Google Play (drop the leading `#` from `app_name`). |
| `type` | ✅ | `Messaging` · `Dialer & Contacts` · `Gallery & Media` · `Productivity` · `Social`. Adding a type means updating the schema and the Decision log. |
| `status` | ✅ | `live` (on Google Play, link verified) · `completed` (finished, unpublished) · `in-progress` |
| `featured` | — | `true` shows it on the home page. **Keep exactly 4.** |
| `order` | — | Sort position within its status group (in-progress → live → completed). |
| `icon` | ✅ | `/images/apps/<slug>.webp` (run `npm run icons`). |
| `playPackage` | live only | The `applicationId`; the Google Play URL is derived from it. |
| `developer` / `developerUrl` | live | The Google Play developer (Play Console) account that publishes the app, written by `npm run play-meta -- <slug>`. Shown as "by …" on cards, the app page (linked) and the share image. |
| `summary` | ✅ | One sentence, ≤ 110 chars. Used for cards, SEO and share images. |
| `features` | ✅ | 3–10 user-facing bullets. |
| `highlights` | ✅ | 2–8 technical bullets. |
| `tags` | ✅ | 3–12 technologies. **Reuse existing spellings** (`Jetpack Compose`, not `Compose`). |
| `basedOn` | — | The open-source project it derives from (honest credit). |
| `variants` | — | One sentence if several source folders are grouped here. |
| `screenshots` | — | `[{ src, alt, width, height }]`, written by `npm run screenshots -- <slug>` from the app's **own** Play listing. |
| *(body)* | ✅ | The case study: `## Overview`, `## How it works`, `## Architecture`… Only facts visible in the code. |

### Blog posts: `content/blog/<slug>.md`

| Field | Required | Rules |
| --- | --- | --- |
| `title` | ✅ | 5–100 chars |
| `description` | ✅ | 30–170 chars (meta description, cards, RSS) |
| `date` / `updated` | ✅ / — | `YYYY-MM-DD` |
| `tags` | ✅ | 1–8 |
| `relatedProjects` | — | Existing project slugs (checked) |
| `draft` | — | `true` = visible only in `npm run dev` / `build:drafts`; **stripped from production bundles** |

Reading time is computed automatically. The article **list** (published, drafts, ideas) is tracked in [`POSTS.md`](POSTS.md).

### Icon rules
Copy the icon from the app's source, in this order of preference:
1. `app/src/main/ic_launcher-playstore.png`
2. `res/mipmap-xxxhdpi/ic_launcher.(png|webp)`
3. The file named by the manifest's `android:icon`

Save it as `public/images/apps/<slug>.png`, then run `npm run icons`, which converts it to a 256×256 WebP and updates `icon:`.

### Writing rules
- Describe only what the code shows. **Never invent** downloads, ratings, users, clients or dates.
- **Never copy secrets** (ad unit IDs, API keys, keystore info, push IDs). `npm run check` scans for them.
- If the app is a fork or rebrand of open-source code, set `basedOn`.
- Group variant folders of one product (same `applicationId`) into **one** file.

### Other content
Profile, socials, skills, experience and education are in [`src/data/portfolio.js`](../src/data/portfolio.js). The app **list** is tracked in [`PROJECTS.md`](PROJECTS.md).

---

## 4. Design system

- **Theme:** emerald → green → teal gradient. Tokens are `--color-brand-*` in [`src/style.css`](../src/style.css).
- **Utilities:** `bg-brand-gradient`, `text-gradient`, `card`, `btn-primary`, `btn-ghost`, `container-page`, and **`prose-site`** for Markdown (Tailwind typography, themed).
- **Code blocks:** Shiki, with dual GitHub light/dark themes that follow the site theme.
- **Status colours:** live = emerald, completed = sky, in-progress = amber (`StatusBadge.vue`).
- **Motion:**
  - `v-reveal` directive, plus the `TypeWriter`, `CountUp` and `IconMarquee` components
  - all motion respects `prefers-reduced-motion`
- **Components:** `GooglePlayBadge` (sm/md/lg), `ScreenshotGallery` (PhotoSwipe), `PostCard`, `TableOfContents`, `CommandPalette`.

---

## 5. Tech & build

| Concern | How |
| --- | --- |
| Rendering | `vite-ssg`: every route is pre-rendered to static HTML (`dirStyle: 'flat'` → `/about` = `about.html`, HTTP 200) |
| Content | `unplugin-vue-markdown`: each `.md` is a Vue component that exports its frontmatter. Loaded in [`src/content/index.js`](../src/content/index.js) (browser) and [`scripts/content-fs.mjs`](../scripts/content-fs.mjs) (Node, with validation) |
| Routes, sitemap, RSS, share images | Generated from the content in `vite.config.js` (`includedRoutes`, `onFinished`) |
| Images | `npm run icons` (icons), `npm run screenshots` (Play screenshots), `vite-plugin-image-optimizer` at build |
| Check | `npm run check` → [`scripts/check-content.mjs`](../scripts/check-content.mjs) |
| Deploy | `npm run deploy -- "message"` (or `publish.cmd`): check → commit → push → Actions (`npm ci` → `npm run check` → `npm run build` → GitHub Pages) → waits and verifies the live site |

**SSR safety:** no `window`/`document` during setup (use `onMounted`, handlers, `typeof document` guards).

---

## 6. SEO

- **Per-page meta tags** come from `useSeo()` in [`src/composables/seo.js`](../src/composables/seo.js): title, description, canonical, Open Graph, Twitter `summary_large_image`, `article:published_time`, JSON-LD.
- **JSON-LD:**
  - Person + WebSite (home)
  - ProfilePage (about)
  - CollectionPage/ItemList (projects)
  - SoftwareApplication + BreadcrumbList (each app)
  - Blog (blog)
  - BlogPosting + BreadcrumbList (each post)
- **Share images:** generated per page at build by [`scripts/og.mjs`](../scripts/og.mjs) (satori + resvg) → `/og/default.png`, `/og/projects/<slug>.png`, `/og/blog/<slug>.png`. Nothing to maintain by hand.
- **Generated files:** `sitemap.xml` (pages + posts), `blog/rss.xml` + `blog/atom.xml` (published posts). **Static:** `robots.txt`.

---

## 7. Search & PWA

- **Search:** MiniSearch ([`src/utils/search.js`](../src/utils/search.js)) over pages, apps (frontmatter + case study) and posts (full text).
  - prefix + fuzzy matching; title > tags > summary > body
  - all words must match, falling back to any word
  - the index loads lazily on the first search
  - used by both the command palette and the Projects page
- **PWA:** `vite-plugin-pwa` (generateSW, auto-update)
  - installable, with a manifest and icons from `npm run icons`
  - pages are network-first, so deploys show immediately; images are cache-first; assets are precached

---

## 8. Backlog

- [x] Review the 3 draft articles in `content/blog/` and publish (`draft: false`)
- [x] Real email in `profile.email`
- [x] Company & dates in `experience`
- [x] Education (MCA, BCA) + interactive career journey on /about
- [ ] University names in `education`
- [ ] LinkedIn / other profiles in `socials`
- [ ] Optional: `public/resume.pdf` + `resumeUrl`
- [ ] Google Search Console: verification meta tag, then submit `sitemap.xml`
- [ ] Set the repo "Website" field to https://ravisorathiya.github.io/
- [ ] Ideas: more articles (`/new-post`), Play ratings (only from real data)

---

## 9. Decision log

Newest first. Record decisions that a future agent might otherwise undo.

| Date | Decision |
| --- | --- |
| 2026-10-06 | Search (`src/utils/search.js`) also indexes every `##` section of posts and case studies (results deep-link to `#anchor`, using the same slug rule as markdown-it-anchor) and the real About/Contact/Home text. It also applies domain synonyms (exact-match only, weighted 0.35) and light plural stemming. The palette shows a "Sections" group with highlighted matches. |
| 2026-10-06 | SEO goal is to rank first for name searches ("ravi sorathiya" + android/kotlin/compose). WebSite schema `name` is the plain name (Google site name), and Person schema carries `alternateName` (social handles) and `homeLocation`. Don't rename these back to "… — Portfolio". |
| 2026-10-06 | Socials are GitHub, X and Instagram. Crypto tips go through a Binance Pay **Support** dialog (`SupportDialog.vue`) opened from the Contact page and the footer, with no dedicated page. Its QR is cropped to `public/images/support/binance-pay.webp`. |
| 2026-10-05 | Site moved to the `ravisorathiya` GitHub account: repo `ravisorathiya/ravisorathiya.github.io`, live at https://ravisorathiya.github.io/ (old ravioriginfo.github.io URL retired). |
| 2026-10-05 | Site-wide animated galaxy background (`StarField.vue`, canvas): parallax stars, cursor constellations, shooting stars; paused when hidden, static under reduced motion. |
| 2026-10-05 | Google Search Console verified via HTML file `public/google4041c6d8e2b20818.html` (never delete it, or verification is lost). |
| 2026-10-02 | One-command publishing (`npm run deploy` / `publish.cmd`). Claude publishes every finished change automatically (owner preference). |
| 2026-10-02 | Each live app shows its publishing Google Play developer account ("by …") on cards, the app page and share images. |
| 2026-10-02 | Articles get their own registry, `docs/POSTS.md`, checked by `npm run check` like `PROJECTS.md`. |
| 2026-10-02 | **Content-driven:** projects and posts are Markdown files validated by zod; the old hard-coded `projects` array was removed. |
| 2026-10-02 | Blog ("Dev Notes") added. Articles are drafted from real code and stay `draft: true` until the owner approves; drafts are stripped from production bundles. |
| 2026-10-02 | Screenshots come only from each app's **own** Google Play listing (owner approved). Design-reference images in the source repos are never published. |
| 2026-10-02 | Share images are generated per page at build (satori), replacing the hand-made `og.png`. |
| 2026-10-02 | MiniSearch replaced the custom scorer (fuzzy, full-text, articles included). |
| 2026-10-02 | Only published (or actively developed) apps are shown; unpublished duplicates removed (see `PROJECTS.md` → Excluded). |
| 2026-10-02 | Pre-render with `vite-ssg` so deep links return 200 (the SPA `404.html` fallback blocked indexing). |
| 2026-10-02 | Green gradient theme replaced indigo/violet (owner preference). |
| 2026-10-02 | Variant folders of one product are grouped into one entry. |
| 2026-10-02 | Google Play links are shown publicly (owner approved); no source code, keys or ad IDs are ever published. |
| 2026-10-08 | Profile photo (`public/images/avatar.webp`, from the X profile picture) replaces the "RS" initials. It is shown as a CSS-3D `Avatar3D` (follows the cursor, drag/click to spin 360°, orbiting socials) on Home, Contact and the blog ContactCard, and statically in the blog mockups. No three.js. |
