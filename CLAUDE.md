# CLAUDE.md

Guidance for AI agents working on this repo. **This site is maintained with AI**, so follow these workflows exactly and keep the docs in sync.

- **What:** Ravi Sorathiya's Android-developer portfolio → **https://ravisorathiya.github.io/**
- **Stack:**
  - Vue 3, Vite 8, Tailwind CSS v4 (+ typography), Vue Router 5
  - pre-rendered with `vite-ssg`
  - **content is Markdown** (`unplugin-vue-markdown` + Shiki)
  - MiniSearch search, satori share images, PhotoSwipe lightbox, PWA (`vite-plugin-pwa`)
- **Deploy:** `.github/workflows/deploy.yml` runs on every push to `main`: `npm ci` → `npm run check` → `npm run build` → GitHub Pages.

## Read first

| File | What it is |
| --- | --- |
| [`docs/SITE_PLAN.md`](docs/SITE_PLAN.md) | Pages, content model (field-by-field), design system, SEO, search, PWA, backlog, **decision log** |
| [`docs/PROJECTS.md`](docs/PROJECTS.md) | **Project registry**: Inbox (to add), Registry (on site), Excluded (never re-add), Changelog |
| [`docs/POSTS.md`](docs/POSTS.md) | **Blog registry**: Ideas (to write), Registry (published / draft), Changelog |
| `content/projects/<slug>.md` | One app = one file: frontmatter (data) + Markdown case study |
| `content/blog/<slug>.md` | One article = one file: frontmatter + Markdown body (`draft: true` until approved) |
| [`src/content/schema.js`](src/content/schema.js) | zod schemas, the exact rules every content file must pass |
| [`src/data/portfolio.js`](src/data/portfolio.js) | Profile, skills, experience, nav (non-Markdown content) |

## Commands

```bash
npm run dev            # http://localhost:5173 (drafts visible, with a Draft banner)
npm run check          # validate all content + registry sync + secrets scan (CI runs this; must pass)
npm run build          # pre-render all pages + sitemap + RSS + share images + service worker
npm run build:drafts   # local preview build that includes draft posts (never deploy this)
npm run icons          # normalise app icons to 256px WebP (+ PWA icons)
npm run screenshots -- <slug>   # fetch a live app's screenshots from its own Google Play listing
npm run og             # regenerate share images (+ README banner public/og.png)
npm run play-meta -- <slug>     # record the Play developer (console) account of a live app
npm run deploy -- "message"    # check → commit → push → wait for the deploy → verify live (also: publish.cmd)
```

## Workflows

### Add a project (`/add-project <folder>`, or "process the project inbox")
Source projects live in `D:\workspace\producation\` (shipped) and `D:\workspace\development\` (`completed/`, `ongoing/`).

1. **Check `docs/PROJECTS.md` → Excluded and Registry.** Don't re-add excluded apps. If the `applicationId` is already registered, it's a variant: update that file (and `variants`) instead.
2. **Read the source folder (read-only, never modify it).** Pick the newest version subfolder and the main app module, then collect:
   - `app_name` and `applicationId`
   - language and UI toolkit
   - main libraries
   - manifest: permissions, services, roles
   - the project's own README / CLAUDE.md
3. **Check Google Play status:** `curl -s -o /dev/null -w "%{http_code}" "https://play.google.com/store/apps/details?id=<applicationId>&hl=en"`
   - 200 → `status: live` + `playPackage`
   - otherwise `completed` / `in-progress` (ask the owner if unclear)
4. **Copy the icon** to `public/images/apps/<slug>.png`, using the preference order in SITE_PLAN §3. Then run `npm run icons`, which converts it to WebP and fixes `icon:`.
5. **Create `content/projects/<slug>.md`.** Copy the structure of an existing file such as `content/projects/phone-call.md`:
   - frontmatter fields per `src/content/schema.js` (no secrets)
   - a case-study body (`## Overview`, `## How it works`, `## Architecture`…) describing only what the code shows
   - `order` sets the position within its status group
6. **If live:** `npm run screenshots -- <slug>` and `npm run play-meta -- <slug>` (adds the Play developer account name + link)
7. **Update `docs/PROJECTS.md`:**
   - add the Registry row
   - update Totals
   - remove the Inbox line
   - add a Changelog line with today's date
8. **Update the README** "See all N apps" count and its featured table if needed. Text that derives counts from content updates automatically, and so do the share images.
9. **Verify:**
   - `npm run check` passes
   - `npm run build` renders `dist/projects/<slug>.html` and `dist/og/projects/<slug>.png` (look at the image)
10. **Publish:**
    - commit, then push to `main`
    - wait for the Actions run to succeed
    - `curl https://ravisorathiya.github.io/projects/<slug>` → 200

### Remove a project (`/remove-project <slug>`)
1. Delete `content/projects/<slug>.md`, `public/images/apps/<slug>.webp` and `public/images/apps/<slug>/`.
2. In `docs/PROJECTS.md`:
   - move the row from Registry to **Excluded** (with reason and date)
   - update Totals
   - add a Changelog line
3. If it was `featured`, promote another app so exactly 4 stay featured.
4. Update the README count, then `npm run check`, build, commit, push, and verify the old URL returns 404.

### Update a project
Edit `content/projects/<slug>.md`. If title/status/type/featured/playPackage changed, update the registry row too. **Never rename a published file/slug** (it breaks links and SEO).

### Write an article (`/new-post <topic>`, or "write the next article from the ideas list")
1. Pick the topic (from the argument, or the top of **Ideas** in `docs/POSTS.md`). Research the topic from the real source projects (read-only). Never invent numbers, users or results, and never include secrets (keys, ad IDs, keystores).
2. Create `content/blog/<kebab-slug>.md` with frontmatter per `postSchema`:
   - `title`, `description` (≤ 170 chars), `date`, `tags`, `relatedProjects`
   - **`draft: true`**
3. Write the article: an intro, `##` sections (they become the table of contents), simplified code snippets, and a takeaways section. Link apps as `/projects/<slug>`.
4. **Update `docs/POSTS.md`:** add the Registry row (slug, title, `draft`, date, related apps), update Totals, remove the idea line, and add a Changelog line.
5. `npm run check`, then let the owner review with `npm run dev` (or `npm run build:drafts`). **Only after the owner approves**, set `draft: false`, change the Registry status to `published`, add a Changelog line, then build, commit, push, and confirm `https://ravisorathiya.github.io/blog/<slug>` returns 200.

## Publishing (always)

The owner wants **every finished change published without being asked**. After any change:
1. Commit it yourself with a clear message and the Co-Authored-By trailer.
2. Run `npm run deploy`. It re-runs the check, pushes, waits for GitHub Actions, and verifies the live site. Use `npm run deploy -- --build` for code changes so the build is tested locally first.
3. Report the live URL. If the deploy fails, fix it and run it again; never leave the site broken.

The only exceptions: draft blog posts stay `draft: true` until the owner approves them (publishing the rest of the site is still fine), and anything outward-facing beyond this site (other repos, accounts) still needs the owner's OK.

## Rules

- **Read-only on `D:\workspace\producation` and `D:\workspace\development`.** Never edit, build or commit there.
- **Never publish secrets:** ad unit IDs, API keys, keystore files or passwords, push-service IDs, source code. `npm run check` scans for common ones.
- **Don't invent facts.** Leave `// TODO` placeholders for the owner.
- **Drafts never ship:** a Vite plugin strips draft posts from production bundles. Don't bypass it, and never deploy a `build:drafts` output.
- **SSR-safe code only:** no `window`/`document` during component setup (use `onMounted`, handlers, or `typeof document` guards).
- **Per-page SEO** goes through `useSeo()` (`src/composables/seo.js`); don't set `document.title` manually.
- **Keep both registries in sync:** `npm run check` fails if `docs/PROJECTS.md` or `docs/POSTS.md` disagree with `content/`.
- **Record decisions:** when a decision changes, add a row to SITE_PLAN §9 Decision log.
- **Commits:** end messages with the Co-Authored-By trailer used in the history.
