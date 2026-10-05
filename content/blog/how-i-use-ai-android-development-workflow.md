---
title: "How I shaped AI to fit my Android development workflow"
description: "Not prompts, a system: the project memory, version-wise bug tracking, custom skills and device-first verification I use to make AI agents useful on real Android apps."
date: 2026-10-05
tags: ["AI", "Android", "Claude Code", "Productivity", "Kotlin"]
relatedProjects: ["pdf-reader", "phone-call"]
draft: false
---

<script setup>
import AiWorkflowLoop from '/src/components/blog/AiWorkflowLoop.vue'
import AiMemoryExplorer from '/src/components/blog/AiMemoryExplorer.vue'
import VerifyStatusDemo from '/src/components/blog/VerifyStatusDemo.vue'
import SkillMatcher from '/src/components/blog/SkillMatcher.vue'
</script>

Most "AI for developers" posts are about prompts. My experience building Android apps with AI agents (mostly Claude Code) is that the prompt is the least important part. What matters is the **environment the agent walks into**: what it reads first, where it remembers things, what it's allowed to call "done", and which recurring jobs it already knows how to do.

I didn't adapt my workflow to the AI. I shaped the AI to fit my workflow. This post shows how, with the real structure from my [PDF Reader & Editor](/projects/pdf-reader), a multi-module Kotlin + Jetpack Compose app. Every box below is interactive.

## The problem: every session starts with amnesia

An AI agent is a very fast developer who joins your team every morning with **zero memory of yesterday**. On a small script that's fine. On a real app it hurts:

- It re-discovers the same architecture every session, and burns context doing it.
- It "fixes" a bug that was already fixed, or re-breaks one that was fragile.
- It trusts upstream documentation over the code in front of it. My PDF editor runs a **vendored fork of pdf.js**, and upstream docs are confidently wrong about it.
- It says "fixed!" after the code compiles, while on a device nothing changed.

None of these are prompt problems. They're **memory, process and verification** problems, so that's what I built.

## Shape 1: a map the agent reads first

Every project has a `CLAUDE.md` at its root. It's not a README for humans. It's the briefing an agent needs to avoid the expensive mistakes:

- the **module map** and dependency direction (`app` → `presentation:*` → `domain`/`core` → `data`);
- the exact commands, including the fast one: compile only the module you touched;
- the patterns to follow (manual DI through a `DomainModule.container`, a State / Action / Event pattern per screen);
- the **known traps**, written as rules. For example: *read the actual `pdf.mjs` before relying on any API; don't guess from upstream pdf.js docs, this fork has diverged.*

```text
# CLAUDE.md (simplified excerpt)
.\gradlew.bat :presentation:pdf:compileDebugKotlin   # fast iteration
- DI is manual, not Hilt/Koin/Dagger.
- Only ever edit JS under src/main/assets (build/ has stale copies).
- The vendored pdf.mjs has real API gaps vs upstream docs.
```

Every line in that file exists because an agent (or I) once lost time to it. That's the rule I follow: **when a mistake costs me time twice, it becomes a line in `CLAUDE.md`.**

## Shape 2: a memory module that never ships

The bigger fix was giving the project a **long-term memory**. My PDF app has a Gradle module called `:ai` that holds only Markdown and screenshots. No production module may depend on it, nothing in it ships, and it never contains secrets. Its README opens with the whole idea in one line:

> **Any agent. Any session. Same memory.**

It's split by the question each folder answers:

- `workflow/` answers **when**: one folder per app version (`v_1_0` = `versionName "1.0"`), each with an `overview.md` and numbered phases of work + QA.
- `plans/` answers **what and how**: one file per feature, fix or migration, with the plan, living design notes and status.
- `events/` is the analytics reference, and `assets/` holds annotated screenshots and reference videos.

Click around, then try the "where does this note go?" questions:

<AiMemoryExplorer />

Because it's a module inside the repo, it's versioned with the code, visible in Android Studio next to `app/` and `domain/`, and readable by **any** agent, not just one tool's private memory.

## Shape 3: a loop, not a chat

With a map and a memory, every session can follow the same loop. The agent reads the rules, loads the current state, plans, builds the smallest change, gets it verified, and **writes what it learned back** for the next session:

<AiWorkflowLoop />

Step 6 is the one people skip, and it's the one that makes the rest work. A good handoff is short: status, findings, what's left, key files. It's enough for a *different* agent to continue cold.

## Shape 4: "it compiles" is not "it works"

This is the rule that changed my results the most. In my workflow, **compiling and reading code are not verification**. A bug line can only be ticked after the fix actually ran. Everything else stays `[~]` with a `VERIFY ON DEVICE` tag, so I can see at a glance what still needs my phone.

<VerifyStatusDemo />

A real example of why this matters. My splash screen has an App Open ad controlled by a Remote Config flag. When the flag was off, a fixed 10-second loader kept disappearing early. Several "fixes" to the ad's state machine looked right in code and did nothing.

Reading **logcat on a real device** found the actual cause. The splash waited at most 3.5 seconds for Remote Config, but on that device the cold fetch took about 4 to 4.5 seconds. When the timeout won, the code read the **compiled default** (`"yes"`) instead of the real remote value (`"no"`), so the ad path ran instead of the loader path. The state machine was fine all along. The fix was a longer wait, and the plan file now says: *if this regresses, check this race first.*

No amount of static reasoning would have found that. The same is true for my pdf.js editor: the agent forwards the WebView's DevTools socket over `adb`, then calls and even live-patches JavaScript on the running page before touching source. More on that in [Building a PDF editor on Android with pdf.js inside a WebView](/blog/pdf-editor-pdfjs-webview-android).

## Shape 5: skills for the jobs I repeat

Some tasks come up again and again across my apps: wiring an ad onto a screen, setting up a splash screen, handling a denied permission. Explaining them from scratch every time is slow and inconsistent, so I turned them into **skills**: small instruction files that Claude Code loads automatically when a request matches their description.

A skill isn't a code template. It explains **why** the pattern looks the way it does, so the agent can apply it to a screen it has never seen:

<SkillMatcher />

The ad-wiring skill is a good example. In my [Phone Call](/projects/phone-call) app an ad placement is four pieces that must agree: an `AdsConstant.kt` fallback, a `RemoteConfigManager.kt` block, the shimmer layout, and the Activity code. Skip the Remote Config block and the ad can never be changed without a new release, and nothing errors to tell you. The skill makes "all four, every time" the default. It even checks that it's in the right repo first, and stops instead of improvising if it isn't. I also keep a small eval set for it, so I can check that a change to the skill doesn't make it worse.

## Shape 6: I stay the one who decides

The agent writes most of the code, but some decisions stay with me, and the rules say so explicitly:

- **Screenshots define appearance, not logic.** When I hand over a screenshot or a video, the agent analyses it first and tags anything the image can't answer as `ASK DEV`.
- **Reference videos are the spec.** Several editor features were built to match a reference recording frame by frame, and the video wins if it disagrees with a written spec.
- **Ask, don't guess** when behaviour is ambiguous, when a change touches the architecture, or when secrets or destructive migrations are involved.
- **A clear order of truth:** my current instruction, then `CLAUDE.md`, then the current code, then the task notes, then old notes. The code outranks the memory, so stale notes can't win.

## Bonus: this site runs the same way

This portfolio is built and maintained the same way. Its `CLAUDE.md` defines workflows like "add a project" and "write an article", the apps and articles live in registries the agent keeps up to date, and an `npm run check` step fails the deploy if the content and the registries drift apart. This article started as a draft in that pipeline and was only published after I reviewed it.

## Takeaways

- **Don't optimise prompts, optimise the environment.** A map (`CLAUDE.md`), a memory, and rules beat clever wording.
- **Give the project a memory that lives in the repo**, split into *when* (versions, phases) and *what/how* (plans), so any agent can continue cold.
- **Make "write it back" part of every task.** The handoff is what turns separate sessions into one project.
- **Compiling isn't verifying.** Keep an explicit `VERIFY ON DEVICE` state, and use logcat and live debugging to verify.
- **Turn repeated jobs into skills that explain the *why*,** not just the code.
- **Keep the decisions human:** ambiguity becomes a question, not a guess.

If you want to see what this produces, browse the [apps](/projects), starting with the [PDF Reader & Editor](/projects/pdf-reader).
