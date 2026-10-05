// ─────────────────────────────────────────────────────────────
// All site content lives here — every page reads from this file.
// App icons live in /public/images/apps/ and are referenced as
// '/images/apps/<file>'.
// ─────────────────────────────────────────────────────────────

export { SITE_URL } from './site.js'
import { posts, projects } from '../content'

const liveCount = projects.filter((p) => p.status === 'live').length

export const profile = {
  name: 'Ravi Sorathiya',
  role: 'Android Developer',
  roles: ['Android Developer', 'Kotlin & Jetpack Compose', 'Shipping apps to Google Play', 'Clean Architecture fan'],
  tagline:
    'I build and ship Android apps people use every day — dialers, SMS messengers, galleries, calendars and a full PDF editor.',
  location: 'India',
  email: 'ravisorathiya1756@gmail.com',
  resumeUrl: '', // e.g. '/resume.pdf' after adding the file to /public
  availableForWork: true,
  avatar: '', // e.g. '/images/avatar.jpg' — leave empty to show initials
  shortBio:
    `Android developer working in Kotlin and Jetpack Compose. I have shipped ${liveCount} apps to Google Play — from default dialers and SMS clients that take over core phone roles, to media galleries and productivity tools.`,
  bio: [
    'I build native Android apps end to end: architecture, UI, background work, monetization and release. Most of my work lives on Google Play, where apps have to be fast, stable and pass strict policy review.',
    'A lot of it sits close to the platform — replacement phone dialers built on InCallService and CallScreeningService, default SMS/MMS messengers, exact-alarm scheduling, home-screen widgets, and media apps that handle Android 14 partial photo access.',
    'Right now I am building a full PDF reader and editor: pdf.js running inside a WebView bridged to Kotlin, with annotation, signatures, in-place text editing, form filling, password lock and a camera document scanner, split across ~15 Clean Architecture modules.',
  ],
}

export const socials = [
  { name: 'GitHub', url: 'https://github.com/ravisorathiya', icon: 'github' },
  // { name: 'LinkedIn', url: 'https://www.linkedin.com/in/your-username', icon: 'linkedin' },
  // { name: 'X', url: 'https://x.com/your-username', icon: 'x' },
]

export const skills = [
  { group: 'Languages', items: ['Kotlin', 'Java', 'JavaScript', 'SQL'] },
  { group: 'Android UI', items: ['Jetpack Compose', 'Material 3', 'XML Views', 'ViewBinding', 'Navigation', 'Lottie'] },
  { group: 'Architecture & DI', items: ['Clean Architecture', 'MVVM', 'Multi-module', 'Hilt', 'Coroutines', 'Flow', 'RxJava'] },
  { group: 'Data & Background', items: ['Room', 'DataStore', 'Realm', 'WorkManager', 'Retrofit', 'Foreground Services'] },
  { group: 'Media & Camera', items: ['Media3 ExoPlayer', 'Coil', 'Glide', 'CameraX', 'OpenCV', 'LiteRT', 'PDFBox', 'pdf.js'] },
  { group: 'Platform & Telephony', items: ['InCallService', 'CallScreeningService', 'Default SMS role', 'App Widgets', 'Exact Alarms', 'Biometric'] },
  { group: 'Firebase & Monetization', items: ['Firebase', 'Remote Config', 'Crashlytics', 'AdMob', 'UMP Consent', 'Play Billing'] },
  { group: 'Tooling & Release', items: ['Gradle KTS', 'Baseline Profiles', 'Macrobenchmark', 'In-app Updates', 'Git'] },
]

export const experience = [
  {
    role: 'Android Developer',
    company: 'Origin Infotech',
    period: 'Apr 2025 — Present',
    description:
      'Building and maintaining a portfolio of consumer Android apps on Google Play: dialers, SMS messengers, galleries, calendar, alarm clock and utilities.',
    tags: ['Kotlin', 'Jetpack Compose', 'Firebase'],
  },
  {
    role: 'Android Developer',
    company: 'Wonder Software',
    period: 'Jan 2021 — Mar 2025',
    description: 'Built and maintained native Android apps in Kotlin and Java.',
    tags: ['Kotlin', 'Java'],
  },
]

export const education = [
  {
    role: 'Degree name', // TODO
    company: 'University Name',
    period: '20XX — 20XX',
    description: 'Add your education here.',
  },
]

export const statuses = {
  live: { label: 'Live on Play', short: 'Live' },
  completed: { label: 'Completed', short: 'Completed' },
  'in-progress': { label: 'In progress', short: 'In progress' },
}

// Projects and blog posts live in Markdown under /content (see src/content/index.js).
export { projects, posts, types, postTags, getProject, getPost } from '../content'

export { liveCount }

export const stats = [
  { label: 'Apps live on Google Play', value: projects.filter((p) => p.status === 'live').length },
  { label: 'Android projects built', value: projects.length },
  { label: 'Technologies used', value: new Set(projects.flatMap((p) => p.tags)).size },
]

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  // Blog appears once there is at least one post (drafts count in local dev).
  ...(posts.length ? [{ label: 'Blog', to: '/blog' }] : []),
  { label: 'Contact', to: '/contact' },
]
