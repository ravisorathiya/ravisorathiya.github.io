---
title: "kotlin-artisan: I built an artisan-style CLI for Android projects"
description: "Why I turned my PowerShell project script into an open-source Kotlin CLI: one word for dark mode, font scale, screenshots, missing translations and Firebase."
date: 2026-10-16
tags: ["Android", "Kotlin", "Open Source", "CLI", "Developer Tools", "adb"]
relatedProjects: ["messages-compose"]
draft: false
---

<script setup>
import ArtisanTerminal from '/src/components/oss/ArtisanTerminal.vue'
import InstallTabs from '/src/components/oss/InstallTabs.vue'
</script>

Laravel developers type `php artisan make:controller` and get on with their day. Android developers type `adb shell cmd uimode night yes`, look up the font-scale setting *again*, and click through three Firebase screens to reach Crashlytics for the right project.

So I built **[kotlin-artisan](/open-source/kotlin-artisan)**: an `artisan`-style command line for Android projects. It's open source (MIT), written in Kotlin, and runs anywhere a JDK runs.

<ArtisanTerminal :only="['app', 'dark', 'strings', 'doctor']" compact />

*That terminal replays real output, captured from v0.2.0 on my [Messages app](/projects/messages-compose). The paths and device serial are masked.*

## Where it came from

It started as a PowerShell script that lived in one project. It switched the phone theme, pulled screenshots into my notes folder, and counted missing translations. Every new project got a copy, and every copy drifted.

**kotlin-artisan is a Kotlin rewrite of that script.** It's one tool that works in any Gradle project, on Windows, macOS and Linux, with no copy per project.

## Zero setup: it reads your Gradle files

Run `artisan` anywhere inside a project and it walks up the folders until it finds `settings.gradle(.kts)`. From there it works everything out **without running Gradle**, just by reading the files:

- **Modules:** every `include(...)`, Kotlin or Groovy DSL, including multi-line includes and `project(":x").projectDir = file("...")` overrides.
- **App module:** the module whose build file applies `com.android.application` (it prefers `:app` when there are several).
- **applicationId, versionName, versionCode:** from the app module's build file (`namespace` is the fallback for the id).
- **Firebase project:** `project_info.project_id` from `google-services.json`, so `open:firebase` lands on *your* project.

```kotlin
// Simplified from Project.kt: walk up to the Gradle root
fun find(start: File): Project? {
    var dir: File? = start.absoluteFile
    while (dir != null) {
        if (SETTINGS.any { File(dir, it).isFile }) return Project(dir, loadConfig(dir))
        dir = dir.parentFile
    }
    return null
}
```

If a guess is wrong, `artisan.json` overrides it. Every key is optional.

## Pickers instead of memorising

I don't want to remember 40 commands, and nobody else does either. So groups are commands too:

- `artisan app` shows a numbered table of every `app:` command. Pick one with a number.
- Leave out a value (`artisan app:font`) and it shows the choices: Small, Default, Large, Larger, Huge.
- Enter cancels. A typo gets a "Did you mean…" hint.

It's a small detail, but it's why I actually use the tool instead of going back to typing adb commands by hand.

## Phone switches for QA

Before every release I check the same things on a real phone: dark theme, a large font, landscape, the app in each language. Each one is now a single word:

```sh
artisan app:install        # build + install + launch the debug app
artisan app:dark on        # dark theme       (app:light to go back)
artisan app:font 1.3       # larger font      (app:font reset)
artisan app:rotate land    # lock landscape   (app:rotate auto)
artisan app:lang de        # per-app language (Android 13+)
artisan app:shot           # screenshot straight into the notes assets folder
```

Under the hood these are plain adb calls (`cmd uimode night`, `settings put system font_scale`, `cmd locale set-app-locales`). The point is that I no longer have to remember them.

## Missing translations, per module

My apps ship in several languages, and the bug I kept hitting was one missing string in one language in one module. `artisan check:strings` prints one row per module and one column per language. Green means complete. A number tells you how many keys are missing.

![artisan check:strings output: a table of modules by languages](/images/oss/kotlin-artisan/strings.svg)

`-v` lists the key names, and `artisan check:strings de` checks just one language.

## A notes workspace that AI agents can use too

`artisan init notes` creates a plain-Markdown workspace: versions, phases, bugs, plans, and an `assets/` folder where `app:shot` and `app:record` save their files. `make:bug`, `status` and `list:verify` keep it tidy.

I use it as cross-session memory for AI coding agents, the same idea as in [how I shaped AI to fit my workflow](/blog/how-i-use-ai-android-development-workflow). Because it's just Markdown in the repo, it works just as well for a human team.

## Small details that matter

- **Your own commands:** add `"deploy:beta": { "run": "./gradlew appDistributionUploadRelease" }` to `artisan.json` and it shows up in a `deploy` picker.
- **Updates:** `artisan self:update` installs the latest release. A background check runs at most once a day, never delays a command by more than about 1.5 s, and stays quiet offline and on CI.
- **Readable output:** coloured boxed tables built with [Mordant](https://github.com/ajalt/mordant) that fit the terminal width, with an ASCII fallback.

## Try it

You need Java 17+ (Android Studio's bundled JDK works) and, for the phone commands, `adb` on your PATH.

<InstallTabs />

Then run `artisan doctor` in any Android project. It checks Java, the SDK, adb, the phone, git and notes, and tells you what's missing.

## Takeaways

- **Wrap your daily chores in words.** Each one saves only seconds, but they add up, and you stop putting off the checks you'd otherwise skip.
- **Detect, don't configure.** Reading the Gradle files gets you almost all of the setup for free. The config file is only for exceptions.
- **Pickers beat docs.** A numbered menu is the best way to make a CLI discoverable.

The code is on [GitHub](https://github.com/ravioriginfo/kotlin-artisan). Issues and PRs are welcome, and a star helps other Android devs find it.
