---
description: Add an Android app from D:\workspace to the portfolio site (or process the PROJECTS.md inbox)
argument-hint: "[source folder under D:\\workspace, e.g. producation/NewApp] [notes]"
---

Add a project to the portfolio site, following **CLAUDE.md → Workflows → Add a project** exactly.

Input: $ARGUMENTS

- If a folder is given, add that project. Any extra words are owner notes (e.g. "feature it", "in progress").
- If no folder is given, process every line in the **Inbox** section of `docs/PROJECTS.md`.

Steps (details in CLAUDE.md):
1. Check `docs/PROJECTS.md`, both Excluded and Registry (to spot variants by applicationId).
2. Read the source folder read-only: app_name, applicationId, stack, libraries, manifest features.
3. Check Google Play status with curl: `live` + `playPackage`, or `completed` / `in-progress`.
4. Copy the icon to `public/images/apps/<slug>.png`, then run `npm run icons`.
5. Create `content/projects/<slug>.md`: frontmatter per `src/content/schema.js`, plus a case-study body. No secrets, no invented facts.
6. If live: `npm run screenshots -- <slug>` and `npm run play-meta -- <slug>` (developer account name + link).
7. Update `docs/PROJECTS.md`: Registry row, Totals, clear the Inbox line, Changelog line with today's date.
8. Update the README "See all N apps" count.
9. `npm run check` and `npm run build` must pass. Look at `dist/og/projects/<slug>.png`.
10. Commit, push to `main`, wait for the deploy to succeed, and confirm `https://ravisorathiya.github.io/projects/<slug>` returns 200.

Finish with a short summary: what was added, its status, its live URL, and anything the owner should confirm.
