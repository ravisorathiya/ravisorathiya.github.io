# Repository Guidelines

## Project Structure & Module Organization

This portfolio uses Vue 3, Vite, Tailwind CSS v4, and `vite-ssg` for static rendering.
- `src/views/` contains route pages; `src/components/` contains reusable Vue components.
- `src/composables/`, `src/utils/`, and `src/router/` hold shared behavior and routing. Profile data lives in `src/data/portfolio.js`.
- `content/projects/` and `content/blog/` contain Markdown with frontmatter validated by `src/content/schema.js`.
- `public/` contains static assets; `scripts/` contains content, image, and deployment utilities. `dist/` is generated output.
- `docs/SITE_PLAN.md` describes architecture; `docs/PROJECTS.md` and `docs/POSTS.md` track content.

## Build, Test, and Development Commands

Use Node.js 24, matching CI, and install dependencies with `npm ci`.
- `npm run dev`: start local development at `http://localhost:5173`, including drafts.
- `npm run check`: validate schemas, registry consistency, asset references, and common secrets.
- `npm run build`: generate production pages, feeds, sitemap, share images, and PWA assets.
- `npm run preview`: serve the built site locally.
- `npm run build:drafts`: build drafts for local review; never deploy this output.
- `npm run icons`: normalize app icons to WebP.

## Coding Style & Naming Conventions

Follow existing two-space indentation, single-quoted JavaScript strings, and omitted semicolons. Use ES modules and Vue `<script setup>`. Name components in PascalCase and content files in kebab-case, such as `phone-call.md`. No formatter or linter is configured.

Keep browser APIs out of server-rendered component setup; use lifecycle hooks or guards. Manage page metadata through `useSeo()`.

## Testing Guidelines

No dedicated test suite, test naming convention, or coverage threshold is configured. Run `npm run check` and `npm run build` before submitting changes. Preview affected routes and check responsive layouts, navigation, and browser console errors for UI changes.

## Commit & Pull Request Guidelines

Use concise, descriptive subjects, such as `Add animated galaxy starfield background` or `SEO: update page metadata`. History includes `Co-Authored-By` trailers; attribute actual contributors accurately. PRs should describe behavior changes, link relevant issues, list validation performed, and include screenshots for visual changes. Pushing to `main` triggers GitHub Pages deployment.

## Content & Security Rules

Keep both content registries synchronized. Preserve published slugs and excluded-project records. New articles stay `draft: true` until owner approval. Never include credentials, ad IDs, keystores, or private source code.
