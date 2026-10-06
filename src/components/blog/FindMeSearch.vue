<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { getPost, getProject, liveCount, profile, projects, socials } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'

// A Google-style results snapshot (blog: find-ravi-sorathiya-android-developer).
// Every title, summary and icon comes from the real content files, so nothing drifts.
const app = (slug) => {
  const p = getProject(slug)
  return { kind: 'app', to: `/projects/${slug}`, title: `${p.title} — Android app by Ravi Sorathiya`, text: p.summary, icon: p.icon }
}
const post = (slug) => {
  const p = getPost(slug)
  return { kind: 'post', to: `/blog/${slug}`, title: p.title, text: p.description, date: p.date }
}
const page = (to, title, text, links = []) => ({ kind: 'page', to, title, text, links })

const searches = [
  {
    label: 'ravi sorathiya android',
    words: ['android', 'developer', 'dev', 'apps', 'app', 'portfolio', 'ravi', 'sorathiya', 'hire'],
    results: [
      page('/', 'Ravi Sorathiya — Android Developer | Kotlin & Jetpack Compose Apps', profile.tagline, [
        { to: '/projects', label: 'Apps', text: `${projects.length} Android apps` },
        { to: '/about', label: 'About', text: 'Skills & experience' },
        { to: '/blog', label: 'Dev Notes', text: 'Technical articles' },
        { to: '/contact', label: 'Contact', text: 'Hire for a project' },
      ]),
      app('phone-call'),
      post('shipping-android-apps-template-remote-config-baseline-profiles'),
    ],
  },
  {
    label: 'ravi sorathiya jetpack compose',
    words: ['compose', 'jetpack', 'ui', 'material', 'sms', 'messages', 'gallery', 'photo'],
    results: [app('messages-compose'), app('gallery-pro'), page('/projects', 'Projects — Ravi Sorathiya', 'Every app, grouped by status, with a case study for each.')],
  },
  {
    label: 'ravi sorathiya kotlin',
    words: ['kotlin', 'java', 'coroutines', 'flow', 'hilt', 'architecture', 'skills', 'dialer', 'call', 'phone'],
    results: [
      page('/about', 'About Ravi Sorathiya — Kotlin & Android Developer', profile.shortBio),
      post('android-dialer-incallservice-callscreeningservice'),
      app('phone-caller-contacts'),
    ],
  },
  {
    label: 'ravi sorathiya pdf editor',
    words: ['pdf', 'editor', 'webview', 'pdfjs', 'pdf.js', 'annotate', 'sign', 'scanner', 'document'],
    results: [post('pdf-editor-pdfjs-webview-android'), app('pdf-reader')],
  },
]
const TABS = [
  { kind: null, label: 'All' },
  { kind: 'app', label: 'Apps' },
  { kind: 'post', label: 'Articles' },
]

const selected = ref(0)
const tab = ref(null)
const query = ref(searches[0].label) // full text on the server, typed on the client
const typing = ref(false)
const loading = ref(false)
const reduced = usePreferredReducedMotion()
let typeTimer
let loadTimer

const results = computed(() => searches[selected.value].results.filter((r) => !tab.value || r.kind === tab.value))
// 'YYYY-MM-DD' → 'Oct 2, 2026' without timezone or locale drift between SSR and the browser.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const shortDate = (d) => `${MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}, ${d.slice(0, 4)}`
const crumb = (to) => 'https://ravisorathiya.github.io' + (to === '/' ? '' : to.replaceAll('/', ' › '))
const googleUrl = computed(() => `https://www.google.com/search?q=${encodeURIComponent(query.value.trim() || searches[selected.value].label)}`)

function load() {
  clearTimeout(loadTimer)
  if (reduced.value === 'reduce') return
  loading.value = true
  loadTimer = setTimeout(() => (loading.value = false), 450)
}

function pick(i) {
  selected.value = i
  tab.value = null
  const text = searches[i].label
  clearInterval(typeTimer)
  if (reduced.value === 'reduce') {
    query.value = text
    return
  }
  query.value = ''
  typing.value = true
  let n = 0
  typeTimer = setInterval(() => {
    query.value = text.slice(0, ++n)
    if (n >= text.length) {
      clearInterval(typeTimer)
      typing.value = false
      load()
    }
  }, 30)
}

// Free typing: show whichever snapshot shares the most words with the query.
function onInput(e) {
  clearInterval(typeTimer)
  typing.value = false
  query.value = e.target.value
  const tokens = query.value.toLowerCase().split(/[^a-z.]+/).filter(Boolean)
  const scores = searches.map((s) => tokens.filter((t) => s.words.includes(t)).length)
  const best = scores.indexOf(Math.max(...scores))
  if (scores[best] > 0 && best !== selected.value) {
    selected.value = best
    tab.value = null
    load()
  }
}

function setTab(kind) {
  tab.value = kind
  load()
}

onBeforeUnmount(() => {
  clearInterval(typeTimer)
  clearTimeout(loadTimer)
})
</script>

<template>
  <figure class="not-prose my-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-[#202124]">
    <!-- Browser chrome -->
    <div class="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-4 py-2.5 dark:border-slate-700 dark:bg-[#2b2c2f]">
      <span class="flex gap-1.5" aria-hidden="true">
        <span class="size-3 rounded-full bg-[#ff5f57]" />
        <span class="size-3 rounded-full bg-[#febc2e]" />
        <span class="size-3 rounded-full bg-[#28c840]" />
      </span>
      <span class="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-slate-500 dark:bg-[#202124] dark:text-slate-400">
        <svg viewBox="0 0 24 24" class="size-3 shrink-0" fill="currentColor" aria-hidden="true"><path d="M17 9V7A5 5 0 0 0 7 7v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9V7Z" /></svg>
        <span class="truncate">google.com/search?q={{ encodeURIComponent(query).replaceAll('%20', '+') }}</span>
      </span>
      <span class="hidden rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase sm:block dark:text-amber-300">Mockup</span>
    </div>

    <!-- Search header -->
    <div class="px-4 pt-4 sm:px-6">
      <div class="flex items-center gap-4">
        <span class="hidden text-2xl font-medium tracking-tight select-none sm:block" aria-hidden="true">
          <span class="text-[#4285f4]">G</span><span class="text-[#ea4335]">o</span><span class="text-[#fbbc05]">o</span><span class="text-[#4285f4]">g</span><span class="text-[#34a853]">l</span><span class="text-[#ea4335]">e</span>
        </span>
        <label class="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition focus-within:shadow-md hover:shadow-md dark:border-[#5f6368] dark:bg-[#303134]">
          <input
            :value="query"
            type="text"
            aria-label="Try your own search"
            placeholder="ravi sorathiya …"
            class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none dark:text-[#e8eaed]"
            @input="onInput"
          />
          <span v-if="typing" class="-ml-2 h-4 w-px animate-pulse bg-[#4285f4]" aria-hidden="true" />
          <a :href="googleUrl" target="_blank" rel="noopener" class="shrink-0 text-[#4285f4]" title="Search this on the real Google" aria-label="Search this on Google (opens a new tab)">
            <AppIcon name="search" class="size-5" />
          </a>
        </label>
      </div>

      <div class="mt-3 flex gap-5 text-sm" role="tablist" aria-label="Result type">
        <button
          v-for="t in TABS"
          :key="t.label"
          type="button"
          role="tab"
          :aria-selected="tab === t.kind"
          class="-mb-px border-b-[3px] pb-2 transition"
          :class="tab === t.kind ? 'border-[#1a73e8] text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]'"
          @click="setTab(t.kind)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Results + knowledge panel -->
    <div class="grid gap-6 border-t border-slate-200 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_15rem] dark:border-[#3c4043]">
      <div class="min-w-0" aria-live="polite">
        <!-- Skeleton while "searching" -->
        <div v-if="loading" class="space-y-6" aria-hidden="true">
          <div v-for="n in 3" :key="n" class="animate-pulse space-y-2">
            <div class="flex items-center gap-2"><span class="size-7 rounded-full bg-slate-200 dark:bg-[#3c4043]" /><span class="h-3 w-40 rounded bg-slate-200 dark:bg-[#3c4043]" /></div>
            <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-[#3c4043]" />
            <div class="h-3 w-full rounded bg-slate-100 dark:bg-[#303134]" />
          </div>
        </div>

        <TransitionGroup
          v-else
          tag="ol"
          class="space-y-6"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-1.5 opacity-0"
        >
          <li v-for="(r, i) in results" :key="selected + r.to" :style="{ transitionDelay: `${i * 70}ms` }">
            <RouterLink :to="r.to" class="group block">
              <span class="flex items-center gap-2.5">
                <img v-if="r.icon" :src="r.icon" alt="" width="28" height="28" class="size-7 shrink-0 rounded-full border border-slate-200 dark:border-[#3c4043]" />
                <span v-else class="grid size-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">RS</span>
                <span class="min-w-0 leading-tight">
                  <span class="block text-sm text-slate-800 dark:text-[#dadce0]">Ravi Sorathiya</span>
                  <span class="block truncate text-xs text-slate-500 dark:text-[#9aa0a6]">{{ crumb(r.to) }}</span>
                </span>
              </span>
              <span class="mt-1.5 block text-lg leading-snug text-[#1a0dab] group-hover:underline sm:text-xl dark:text-[#8ab4f8]">{{ r.title }}</span>
            </RouterLink>
            <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-[#bdc1c6]">
              <span v-if="r.date" class="text-slate-500 dark:text-[#9aa0a6]">{{ shortDate(r.date) }} — </span>{{ r.text }}
            </p>
            <div v-if="r.links?.length" class="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 border-l-2 border-slate-100 pl-4 dark:border-[#3c4043]">
              <RouterLink v-for="l in r.links" :key="l.to" :to="l.to" class="group/l">
                <span class="block text-[#1a0dab] group-hover/l:underline dark:text-[#8ab4f8]">{{ l.label }}</span>
                <span class="block text-xs text-slate-500 dark:text-[#9aa0a6]">{{ l.text }}</span>
              </RouterLink>
            </div>
          </li>
          <li v-if="!results.length" key="empty" class="text-sm text-slate-500 dark:text-[#9aa0a6]">No {{ tab === 'app' ? 'apps' : 'articles' }} for this one. Try <button type="button" class="text-[#1a0dab] underline dark:text-[#8ab4f8]" @click="setTab(null)">All</button>.</li>
        </TransitionGroup>

        <div class="mt-8">
          <p class="text-base text-slate-900 dark:text-[#e8eaed]">People also search for</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="(s, i) in searches"
              :key="s.label"
              type="button"
              :aria-pressed="selected === i"
              class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition"
              :class="selected === i
                ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#174ea6] dark:border-[#8ab4f8] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8]'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#5f6368] dark:text-[#e8eaed] dark:hover:bg-[#303134]'"
              @click="pick(i)"
            >
              <AppIcon name="search" class="size-3.5 opacity-60" /> {{ s.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Knowledge panel -->
      <aside class="h-fit rounded-xl border border-slate-200 p-4 dark:border-[#3c4043]">
        <div class="flex items-center gap-3">
          <span class="grid size-14 shrink-0 place-items-center rounded-full bg-brand-gradient text-lg font-bold text-white">RS</span>
          <span>
            <span class="block text-xl leading-tight text-slate-900 dark:text-[#e8eaed]">{{ profile.name }}</span>
            <span class="block text-sm text-slate-500 dark:text-[#9aa0a6]">{{ profile.role }}</span>
          </span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-[#bdc1c6]">
          Builds native Android apps in Kotlin and Jetpack Compose, with {{ liveCount }} apps live on Google Play.
        </p>
        <dl class="mt-3 space-y-1 text-sm">
          <div><dt class="inline font-semibold text-slate-800 dark:text-[#e8eaed]">Location:</dt> <dd class="inline text-slate-600 dark:text-[#bdc1c6]">{{ profile.location }}</dd></div>
          <div><dt class="inline font-semibold text-slate-800 dark:text-[#e8eaed]">Stack:</dt> <dd class="inline text-slate-600 dark:text-[#bdc1c6]">Kotlin, Compose, Firebase</dd></div>
        </dl>
        <p class="mt-4 text-xs font-semibold text-slate-800 dark:text-[#e8eaed]">Profiles</p>
        <div class="mt-2 flex gap-3">
          <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="me noopener" class="flex flex-col items-center gap-1 text-[11px] text-slate-500 hover:text-brand-600 dark:text-[#9aa0a6]">
            <span class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-[#303134] dark:text-[#e8eaed]"><AppIcon :name="s.icon" class="size-5" /></span>
            {{ s.name }}
          </a>
        </div>
      </aside>
    </div>

    <figcaption class="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:px-6 dark:border-[#3c4043] dark:bg-[#2b2c2f] dark:text-[#9aa0a6]">
      An illustrated mockup, not a live Google result or a ranking claim. Every link goes to the real page. Tap the
      <AppIcon name="search" class="inline size-3.5 align-[-2px]" /> to run your query on Google.
    </figcaption>
  </figure>
</template>
