# Blog Registry: Dev Notes

> **Source of truth for the articles on https://ravisorathiya.github.io/blog.**
> Each article is one Markdown file, `content/blog/<slug>.md`. Every file must have a row in **Registry** with the same
> title, status and date, and every row must have a file. `npm run check` (also run in CI before every deploy) fails if
> they drift apart.
>
> Workflow: [`CLAUDE.md`](../CLAUDE.md#write-an-article-new-post-topic) · Command: `/new-post <topic>` · Site plan: [`SITE_PLAN.md`](SITE_PLAN.md)

**Status:** `published` = `draft: false` (live) · `draft` = `draft: true` (only visible in `npm run dev`)

---

## 💡 Ideas: articles to write

Add a line here, then ask Claude: **"write the next article from the ideas list"** or run **`/new-post <topic>`**.
Claude researches the real source code, writes the article as a draft, adds it to **Registry**, and removes the idea.

<!-- Format: - <topic>, source project(s), optional angle -->

- How the Alarm Clock schedules exact alarms that survive reboots (`producation/Alram_Beatiful_Disater`)
- Home-screen widgets with month navigation in Calendar 2026 (`producation/CalenderUmbreltic`)
- Supporting Android 14 "selected photos only" access in a gallery app (`producation/Gallery - Photo Album`)
- A camera document scanner with OpenCV + LiteRT (`development/ongoing/PDFReaderOrigin`)

---

## 📰 Registry: articles

<!-- posts:start (parsed by scripts/check-content.mjs; keep the table format) -->
| Slug | Title | Status | Date | Related apps |
| --- | --- | --- | --- | --- |
| how-i-use-ai-android-development-workflow | How I shaped AI to fit my Android development workflow | published | 2026-10-05 | pdf-reader, phone-call |
| pdf-editor-pdfjs-webview-android | Building a PDF editor on Android with pdf.js inside a WebView | published | 2026-10-02 | pdf-reader |
| android-dialer-incallservice-callscreeningservice | Writing a replacement phone dialer: InCallService and CallScreeningService | published | 2026-10-01 | phone-call, contacts-dialer, phone-caller-contacts |
| shipping-android-apps-template-remote-config-baseline-profiles | One template, 11 Play Store apps: Remote Config, consent and Baseline Profiles | published | 2026-09-30 | phone-call, messages-compose, gallery-pro, calendar-2026 |
<!-- posts:end -->

**Totals:** 4 articles: 4 published · 0 drafts.

---

## 📝 Changelog

Newest first. One line per change.

- **2026-10-05:** Published "How I shaped AI to fit my Android development workflow" (owner approved).
- **2026-10-05:** Drafted "How I shaped AI to fit my Android development workflow" (from `development/ongoing/PDFReaderOrigin` `:ai` module + personal Claude skills), with 4 interactive Vue components in `src/components/blog/`.
- **2026-10-02:** Published all 3 articles (owner approved).
- **2026-10-02:** Drafted 3 articles from the real source code (PDF editor, dialer, shared app template).
