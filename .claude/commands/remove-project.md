---
description: Remove an app from the portfolio site and record it as excluded
argument-hint: "<slug or app title> [reason]"
---

Remove a project from the portfolio site, following **CLAUDE.md → Workflows → Remove a project** exactly.

Input: $ARGUMENTS

1. Find `content/projects/<slug>.md` by slug or title. If it's ambiguous, ask.
2. Delete that file, `public/images/apps/<slug>.webp` and the `public/images/apps/<slug>/` screenshots folder.
3. In `docs/PROJECTS.md`:
   - move the Registry row to **Excluded**, with the reason (default "owner asked to remove") and today's date
   - update Totals
   - add a Changelog line
4. If it was featured, promote another app (`featured: true`) so exactly 4 stay featured. Tell the owner which one.
5. Remove the slug from any blog post's `relatedProjects`, and update the README "See all N apps" count.
6. `npm run check` and `npm run build` must pass.
7. Commit, push to `main`, wait for the deploy, and confirm the old URL `https://ravisorathiya.github.io/projects/<slug>` returns 404.

Finish with a one-line confirmation, including the new app totals.
