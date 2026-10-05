<div align="center">

<a href="https://ravisorathiya.github.io/">
  <img src="public/og.png" alt="Ravi Sorathiya — Android Developer portfolio" width="100%" />
</a>

# Ravi Sorathiya — Portfolio

**Android developer · Kotlin & Jetpack Compose · 12 apps live on Google Play**

### 🌐 [ravisorathiya.github.io](https://ravisorathiya.github.io/)

[![Live site](https://img.shields.io/badge/Live-ravisorathiya.github.io-10b981?style=for-the-badge&logo=googlechrome&logoColor=white)](https://ravisorathiya.github.io/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/ravisorathiya/ravisorathiya.github.io/deploy.yml?branch=main&style=for-the-badge&label=Deploy&logo=githubactions&logoColor=white)](https://github.com/ravisorathiya/ravisorathiya.github.io/actions)

![Vue](https://img.shields.io/badge/Vue_3-35495E?logo=vuedotjs&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-0F172A?logo=tailwindcss&logoColor=38BDF8)
![Markdown](https://img.shields.io/badge/Content-Markdown-000?logo=markdown&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222?logo=githubpages&logoColor=white)

</div>

---

## 🔗 Quick links

| Page | URL |
| --- | --- |
| 🏠 Home | https://ravisorathiya.github.io/ |
| 👤 About & tech explorer | https://ravisorathiya.github.io/about |
| 📱 All apps (search + filters) | https://ravisorathiya.github.io/projects |
| 🟢 Only apps live on Google Play | https://ravisorathiya.github.io/projects?status=live |
| 📄 Flagship — PDF Reader & Editor | https://ravisorathiya.github.io/projects/pdf-reader |
| 📝 Dev Notes (blog) | https://ravisorathiya.github.io/blog |
| 📡 RSS feed | https://ravisorathiya.github.io/blog/rss.xml |
| ✉️ Contact | https://ravisorathiya.github.io/contact |

> 💡 **Tip:** press <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere on the site to search every app and article.

---

## 📖 Quick guide: how do I…?

**The easiest way to do anything:** open Claude Code in this folder and say it in plain words. Claude makes the change, checks it, **publishes it automatically**, and gives you the link.

| I want to… | Ask Claude | Or do it yourself |
| --- | --- | --- |
| **Publish my changes** | "publish it" | Double-click **`publish.cmd`**, or run `npm run deploy -- "what changed"` |
| **Add an app** from my workspace | `/add-project producation/MyApp` | See [Add a new app by hand](#-add-a-new-app-by-hand) |
| **Add an app** that's only on Google Play | "add this app: <Play Store link>" | Same as above, using the listing for details |
| **Remove an app** | `/remove-project <app>` | Delete its `.md` file + icon, move its row to *Excluded* in `docs/PROJECTS.md` |
| **Write an article** | `/new-post <topic>` (saved as a draft) | Create `content/blog/<name>.md` with `draft: true` |
| **Publish a draft article** | "publish the article <name>" | Change `draft: true` → `draft: false`, then publish |
| **Plan article ideas** | "write the next article from the ideas list" | Add a line under **Ideas** in [`docs/POSTS.md`](docs/POSTS.md) |
| **Change my bio, email, skills, job** | "change my bio to …" | Edit [`src/data/portfolio.js`](src/data/portfolio.js), then publish |
| **Update an app's screenshots** | "refresh screenshots for <app>" | `npm run screenshots -- <app>`, then publish |
| **Preview before publishing** | "show me locally" | `npm run dev` → open http://localhost:5173 |
| **See what's on the site** | "what apps/articles are on the site?" | [`docs/PROJECTS.md`](docs/PROJECTS.md) (apps) · [`docs/POSTS.md`](docs/POSTS.md) (articles) |

**Where things live:**

```
content/projects/   → one .md file per app      (what each app page shows)
content/blog/       → one .md file per article  (draft: true = hidden until you publish)
src/data/portfolio.js → your name, bio, email, skills, experience
docs/PROJECTS.md    → list of apps on the site (+ removed ones, so they never come back)
docs/POSTS.md       → list of articles (+ ideas to write next)
publish.cmd         → double-click to publish
```

**Safety net:** every publish runs `npm run check` first. If something's wrong (a missing or too-long field, an app or article missing from its list, a missing image, a secret key pasted in), it **stops and tells you exactly which file and field**, and nothing broken goes live.

---

## 📱 Featured apps

| | App | What it is | Status |
| :---: | --- | --- | --- |
| <img src="public/images/apps/pdf-reader.webp" width="48" /> | [**PDF Reader & Editor**](https://ravisorathiya.github.io/projects/pdf-reader) | Annotate, sign, edit text, lock, convert & scan PDFs | 🟠 In progress |
| <img src="public/images/apps/phone-call.webp" width="48" /> | [**Phone Call**](https://ravisorathiya.github.io/projects/phone-call) | Default dialer with spam blocking & call themes | 🟢 [Google Play](https://play.google.com/store/apps/details?id=com.phonecall.phone.contact.callerdialer) |
| <img src="public/images/apps/messages-compose.webp" width="48" /> | [**Messages**](https://ravisorathiya.github.io/projects/messages-compose) | Default SMS & MMS app built in Jetpack Compose | 🟢 [Google Play](https://play.google.com/store/apps/details?id=com.message.textmessenger.smsapp) |
| <img src="public/images/apps/gallery-pro.webp" width="48" /> | [**Gallery - Photo Gallery**](https://ravisorathiya.github.io/projects/gallery-pro) | Compose gallery with timeline, editor & photo picker | 🟢 [Google Play](https://play.google.com/store/apps/details?id=com.gallery.picturegalleryapp.gallerypro) |

➡️ **[See all 14 apps →](https://ravisorathiya.github.io/projects)**

---

## ✨ What's on the site

- **Content-driven:** every app and article is a Markdown file in [`content/`](content), validated on every build.
- **App pages:** Google Play screenshots with a zoomable lightbox, a features / under-the-hood breakdown, a written case study, and a Google Play badge.
- **Dev Notes (blog):** technical articles with a table of contents, code highlighting and an RSS feed. The blog appears once the first article is published.
- **Search:** typo-tolerant full-text search across apps and articles. Use <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> anywhere, or the Projects page (filters live in the URL).
- **Tech explorer:** click any technology on the About page to see which apps use it.
- **Installable & offline (PWA)**, with optimised WebP images.
- **SEO:** pre-rendered HTML, structured data, sitemap, and an **auto-generated share image for every page**.

---

## 🤖 AI-driven maintenance

This site is maintained with Claude Code. The plan and project tracking live in the repo:

| File | Purpose |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Rules and step-by-step workflows that AI agents follow |
| [`docs/SITE_PLAN.md`](docs/SITE_PLAN.md) | Site plan: pages, content model, design system, SEO, search, PWA, backlog, decision log |
| [`docs/PROJECTS.md`](docs/PROJECTS.md) | Project registry: 📥 Inbox, ✅ on site, 🚫 excluded, 📝 changelog |
| [`docs/POSTS.md`](docs/POSTS.md) | Blog registry: 💡 ideas, 📰 published & drafts, 📝 changelog |

**Claude Code commands:**

| Command | What it does |
| --- | --- |
| `/add-project producation/MyNewApp` | Reads the app's source, checks Google Play, adds icon + screenshots + a case study, updates the registry, publishes |
| `/remove-project <slug>` | Removes an app and records it as **Excluded** so it's never re-added |
| `/new-post <topic>` | Drafts a Dev Notes article from the real source code (stays a draft until you approve it) |

You can also add a line to the **Inbox** in `docs/PROJECTS.md` and ask Claude to *"process the project inbox"*.

`npm run check` (also run in CI before every deploy) blocks a deploy if any content file is invalid, either registry (apps or articles) disagrees with the content, or a secret slipped in.

---

## 🚀 Publish (one command)

After any change (an app, an article, your bio…), publish with **one** of:

| How | Command |
| --- | --- |
| Terminal | `npm run deploy -- "what changed"` |
| Double-click | **`publish.cmd`** in the project folder (asks what changed) |
| Ask Claude | "publish it". Claude publishes automatically after every change anyway. |

What it does ([`scripts/deploy.mjs`](scripts/deploy.mjs)):

1. `npm run check`: stops if any content is invalid, so nothing broken gets pushed
2. commits all changes with your message (skipped if nothing changed)
3. pushes to GitHub, which triggers the deploy workflow
4. **waits for the deploy** and tells you if it succeeded or failed (with a link)
5. confirms https://ravisorathiya.github.io/ is live

Options: `--build` builds locally first (catches errors before pushing) · `--no-wait` pushes and exits.

---

## ✏️ How to update the site

| I want to… | Edit this |
| --- | --- |
| Add / edit an app | `content/projects/<slug>.md` (+ a row in `docs/PROJECTS.md`) |
| Write / publish an article | `content/blog/<slug>.md` (set `draft: false` to publish) + its row in `docs/POSTS.md` |
| Change my name, bio, email, socials, skills, experience | [`src/data/portfolio.js`](src/data/portfolio.js) |
| Change the colour theme | `--color-brand-*` in [`src/style.css`](src/style.css) |

### ➕ Add a new app by hand

1. **Icon:** put it at `public/images/apps/my-app.png`, then run `npm run icons` (converts it to a 256px WebP).
2. **Content:** create `content/projects/my-app.md` (the file name becomes the URL `/projects/my-app`):

   ```markdown
   ---
   title: "My App"
   type: "Productivity"          # Messaging | Dialer & Contacts | Gallery & Media | Productivity | Social
   status: live                  # live | completed | in-progress
   featured: false               # true = show on the home page (keep exactly 4)
   order: 50
   icon: /images/apps/my-app.webp
   playPackage: com.example.myapp   # omit if not on Google Play
   summary: "One sentence about the app (110 characters max)."
   features:
     - "Feature one"
     - "Feature two"
     - "Feature three"
   highlights:
     - "Interesting technical detail"
     - "Another one"
   tags: ["Kotlin", "Jetpack Compose", "Room"]
   ---

   ## Overview

   What the app does and who it's for.

   ## How it works

   The interesting technical parts.
   ```

3. **Screenshots & developer** (live apps): `npm run screenshots -- my-app` and `npm run play-meta -- my-app` pull them from the app's Google Play listing.
4. **Registry:** add a row to [`docs/PROJECTS.md`](docs/PROJECTS.md), then run `npm run check`.
5. **Publish:** `npm run deploy -- "Add My App"` (or double-click `publish.cmd`).

### 📝 Still to fill in

- [x] ~~Contact email~~ (done)
- [x] ~~Publish the first articles~~ (done: 3 live)
- [ ] `education` (in `src/data/portfolio.js`)
- [ ] LinkedIn / other profiles in `socials`
- [ ] Optional: `public/resume.pdf`, then set `resumeUrl: '/resume.pdf'`
- [ ] Google Search Console: verify the site and submit `sitemap.xml` (see [SEO](#-seo))

---

## 🛠️ Run it locally

Requires **Node 20+**.

```bash
npm install
npm run dev            # dev server → http://localhost:5173 (draft articles visible)
npm run check          # validate content + registry + secrets scan
npm run build          # pre-render pages + sitemap + RSS + share images + service worker
npm run build:drafts   # local preview including draft articles (don't deploy)
npm run preview        # serve the production build
npm run icons          # normalise app icons (+ PWA icons)
npm run screenshots -- <slug>   # fetch Google Play screenshots for an app
npm run og             # regenerate share images (+ this README's banner)
npm run play-meta -- <slug>     # fetch the Play developer (console) name for an app
npm run deploy -- "message"    # publish: check → commit → push → wait → verify
```

---

## 🗂️ Project structure

```
├── .claude/commands/              # /add-project, /remove-project, /new-post for Claude Code
├── .github/workflows/deploy.yml   # check + build + deploy to GitHub Pages on push to main
├── CLAUDE.md                      # AI agent rules + workflows
├── publish.cmd                    # double-click to publish the site
├── content/
│   ├── projects/*.md              # ⭐ one file per app: data + case study
│   └── blog/*.md                  # ⭐ Dev Notes articles
├── docs/
│   ├── SITE_PLAN.md               # site plan, content model, decisions
│   ├── PROJECTS.md                # project registry (inbox / on site / excluded)
│   └── POSTS.md                   # blog registry (ideas / published / drafts)
├── public/
│   ├── images/apps/               # app icons (<slug>.webp) + screenshots (<slug>/*.webp)
│   ├── og.png                     # README banner (generated by npm run og)
│   └── robots.txt, pwa-*.png      # crawler rules, icons for installing the site
├── scripts/
│   ├── content-fs.mjs             # Node content loader + validation
│   ├── check-content.mjs          # npm run check
│   ├── og.mjs                     # share images (satori + resvg)
│   ├── rss.mjs                    # RSS / Atom feeds
│   ├── icons.mjs                  # icon normalisation + PWA icons
│   ├── fetch-screenshots.mjs      # Google Play screenshots
│   ├── play-meta.mjs              # Play developer (console) name
│   └── deploy.mjs                 # one-command publish (npm run deploy / publish.cmd)
├── src/
│   ├── content/                   # schema (zod) + browser loader for content/
│   ├── data/portfolio.js          # profile, skills, experience, nav
│   ├── views/                     # Home, About, Projects, ProjectDetail, Blog, BlogPost, Contact, 404
│   ├── components/                # ProjectCard, ScreenshotGallery, CommandPalette, PostCard, …
│   ├── composables/               # seo.js (meta + JSON-LD), internal links, palette state
│   ├── utils/search.js            # MiniSearch full-text search
│   └── style.css                  # Tailwind theme + Markdown (prose) styles
└── vite.config.js                 # Markdown, PWA, image optimiser, pre-render routes, sitemap/RSS/OG
```

---

## ⚙️ How deployment works

Hosted on **GitHub Pages** at **https://ravisorathiya.github.io/**.

- Every push to `main` triggers [`deploy.yml`](.github/workflows/deploy.yml): `npm ci`, then `npm run check`, then `npm run build`, then publish `dist/`.
- Check progress under the [**Actions** tab](https://github.com/ravisorathiya/ravisorathiya.github.io/actions).
- One-time setting (already done): **Settings → Pages → Source: GitHub Actions**.

---

## 🔍 SEO

| What | Where |
| --- | --- |
| Pre-rendered HTML for every page (HTTP 200) | `vite-ssg`, routes generated from `content/` |
| Title, description, canonical, Open Graph, Twitter | `src/composables/seo.js` |
| Structured data (Person, SoftwareApplication, BlogPosting, Breadcrumbs) | `useSeo()` calls in each view |
| Share image per page | generated at build → `/og/…png` |
| Sitemap / RSS | https://ravisorathiya.github.io/sitemap.xml · `/blog/rss.xml` once posts are published |
| Robots | https://ravisorathiya.github.io/robots.txt |

**Next step:** add the site in [Google Search Console](https://search.google.com/search-console) and submit `sitemap.xml`.

---

<div align="center">

Made with 💚 by **Ravi Sorathiya** · [ravisorathiya.github.io](https://ravisorathiya.github.io/)

</div>
