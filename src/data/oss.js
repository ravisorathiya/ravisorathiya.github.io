// Open-source tools (not apps, so they don't go through content/projects + projectSchema).
// Facts mirror the tool's own README. Plain JS (no JSON import) so vite.config.js and
// scripts/og.mjs can import it in Node; the terminal demos live in artisan-demos.json.

const repo = 'https://github.com/ravioriginfo/kotlin-artisan'
const raw = 'https://raw.githubusercontent.com/ravioriginfo/kotlin-artisan/main'

export const artisan = {
  slug: 'kotlin-artisan',
  path: '/open-source/kotlin-artisan',
  name: 'kotlin-artisan',
  version: '0.2.0',
  license: 'MIT',
  repo,
  releases: `${repo}/releases`,
  tagline: 'Type a word. Your Android project does the rest.',
  summary:
    'An artisan-style command line for Android projects: switch the phone to dark mode, take a screenshot, install the build, find missing translations or open Crashlytics, all with one word.',
  requirements: 'Java 17+ (Android Studio’s bundled JDK works) · adb on PATH for phone commands',
  install: [
    { id: 'windows', label: 'Windows', shell: 'PowerShell', cmd: `irm ${raw}/install.ps1 | iex` },
    { id: 'unix', label: 'macOS / Linux', shell: 'sh', cmd: `curl -fsSL ${raw}/install.sh | sh` },
    { id: 'source', label: 'From source', shell: 'sh', cmd: `git clone ${repo} && cd kotlin-artisan\n./gradlew installDist` },
  ],
  points: [
    { title: 'Zero setup', text: 'Run it anywhere inside a Gradle project. It finds the root, modules, app module, applicationId, version and Firebase project.' },
    { title: 'Pickers, not memorising', text: 'Type a group (artisan app) and pick a number. Leave out a value and it shows the choices.' },
    { title: 'Readable output', text: 'Coloured boxed tables that fit your terminal, on Windows, macOS and Linux.' },
  ],
  useCases: [
    {
      icon: 'android',
      title: 'QA a build on the phone',
      problem: 'Checking dark mode, large fonts and landscape means digging through Settings every time.',
      cmds: ['artisan app:install', 'artisan app:dark on', 'artisan app:font 1.3', 'artisan app:rotate land', 'artisan app:shot'],
    },
    {
      icon: 'layers',
      title: 'Find missing translations',
      problem: 'Is a string missing in German, or in one module only? Reading strings.xml files by hand doesn’t scale.',
      cmds: ['artisan check:strings', 'artisan check:strings de -v'],
    },
    {
      icon: 'external',
      title: 'Jump to the right console',
      problem: 'Crashlytics, Play Console, AdMob: always five clicks and the wrong project selected.',
      cmds: ['artisan open:firebase crash', 'artisan open:play', 'artisan open:studio'],
    },
    {
      icon: 'pen',
      title: 'Notes for teams and AI agents',
      problem: 'Plans, bugs and screenshots end up scattered. Agents forget everything between sessions.',
      cmds: ['artisan init notes', 'artisan make:bug', 'artisan status', 'artisan list:verify'],
    },
  ],
  // From the tool's README command table and `artisan list` output.
  commandGroups: [
    {
      group: 'app:',
      blurb: 'Phone switches for QA',
      commands: [
        ['app:install', 'Build + install the debug APK and launch it'],
        ['app:logcat [tag]', 'Stream logcat: app, crashes, or a tag'],
        ['app:shot [name]', 'Phone screenshot -> notes assets'],
        ['app:record [name] [sec]', 'Screen recording -> notes assets (Enter stops)'],
        ['app:lang [code]', 'Set the app language (Android 13+)'],
        ['app:dark [on|off]', 'Dark / light theme'],
        ['app:font [scale]', 'Font size, e.g. 1.3'],
        ['app:rotate [land|port|auto]', 'Lock landscape / portrait, or auto'],
        ['app:clean', 'gradlew clean (asks first)'],
      ],
    },
    {
      group: 'check:',
      blurb: 'Project health',
      commands: [
        ['check:strings [lang] [-v]', 'Missing/extra translations per module and language'],
        ['check:links', 'Links in the notes that point to a missing file'],
        ['check:assets', 'Asset files nothing links to + links to missing assets'],
      ],
    },
    {
      group: 'open:',
      blurb: 'The right console, one word',
      commands: [
        ['open:firebase [page]', 'Firebase console: overview, crash, config, analytics'],
        ['open:play', 'Google Play Console'],
        ['open:admob', 'AdMob console'],
        ['open:app', 'App info screen on the phone'],
        ['open:studio', 'This project in Android Studio'],
        ['open:report', 'Latest Gradle test/build report in the browser'],
      ],
    },
    {
      group: 'make:',
      blurb: 'Notes workspace',
      commands: [
        ['make:plan [name]', 'Create plans/<snake_case>.md'],
        ['make:version [x.y]', 'Create workflow/v_x_y with overview + phase_1'],
        ['make:phase [summary]', 'Create the next phase file + its overview row'],
        ['make:bug', 'Add a bug line to the latest phase'],
      ],
    },
    {
      group: 'list:',
      blurb: 'Checklists & TODOs',
      commands: [
        ['list:todo [module] [-v]', 'TODO / FIXME / HACK comments in source'],
        ['list:verify [-md]', 'All VERIFY ON DEVICE items as a checklist'],
        ['list:plans', 'Every plan with its status'],
      ],
    },
    {
      group: 'more',
      blurb: 'Everything else',
      commands: [
        ['doctor', 'Check Java, SDK, adb, phone, git, notes'],
        ['stats', 'Code per module, biggest files, notes totals'],
        ['status', 'Version, phase table and every open item'],
        ['build:release [apk|aab]', 'Release APK or AAB + output path and size'],
        ['init [notes]', 'Create artisan.json (or a notes workspace)'],
        ['self:update', 'Update kotlin-artisan to the latest release'],
      ],
    },
  ],
  config: `{
  "package": "com.example.app",
  "appModule": ":app",
  "notes": { "dir": "docs/notes" },
  "logcat": { "tags": ["MyTag", "OkHttp"] },
  "ignoreModules": [":benchmark"],
  "commands": {
    "deploy:beta": {
      "description": "Upload a beta to Firebase App Distribution",
      "run": "./gradlew appDistributionUploadRelease"
    }
  }
}`,
  notesTree: [
    ['notes/', ''],
    ['  README.md', ''],
    ['  workflow/v_1_0/overview.md', 'phase table for version 1.0'],
    ['  workflow/v_1_0/phase_1.md', '## Changes / ## Bugs'],
    ['  plans/', 'one file per feature or fix'],
    ['  assets/', 'screenshots and recordings'],
  ],
  // Static terminal frames (public/images/oss/kotlin-artisan/*.svg), rendered from the same captures.
  shots: [
    { src: '/images/oss/kotlin-artisan/app.svg', alt: 'artisan app: numbered picker of every phone command', width: 695, height: 436 },
    { src: '/images/oss/kotlin-artisan/strings.svg', alt: 'artisan check:strings: missing translations per module and language', width: 746, height: 296 },
    { src: '/images/oss/kotlin-artisan/doctor.svg', alt: 'artisan doctor: Java, SDK, adb, phone, git and notes checks', width: 846, height: 416 },
    { src: '/images/oss/kotlin-artisan/stats.svg', alt: 'artisan stats: Kotlin and Java lines per module', width: 704, height: 356 },
  ],
}

// Every open-source tool, for the /open-source index.
export const ossTools = [artisan]

// Extra pages for pre-rendering, the sitemap, the command palette and the search index.
export const ossPages = [
  {
    label: 'Open source',
    to: '/open-source',
    text: `open source github tools cli ${ossTools.map((t) => `${t.name} ${t.tagline}`).join(' ')}`,
  },
  {
    label: 'kotlin-artisan (open source CLI)',
    to: artisan.path,
    text: `${artisan.summary} ${artisan.commandGroups.flatMap((g) => g.commands.map((c) => c[0])).join(' ')} adb cli terminal command line open source`,
  },
]
