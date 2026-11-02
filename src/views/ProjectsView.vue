<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projects, statuses, types } from '../data/portfolio'
import AppIcon from '../components/AppIcon.vue'
import ProjectCard from '../components/ProjectCard.vue'
import SectionHeading from '../components/SectionHeading.vue'
import { SITE_URL } from '../data/portfolio'
import { useSeo } from '../composables/seo'
import { search } from '../utils/search'

useSeo({
  title: 'Android Apps & Projects',
  description: `${projects.length} Android apps by Ravi Sorathiya: phone dialers, SMS messengers, photo galleries, calendar, alarm clock and a PDF editor — ${projects.filter((p) => p.status === 'live').length} live on Google Play.`,
  path: '/projects',
  jsonLd: [
    {
      '@type': 'CollectionPage',
      name: 'Android Apps & Projects',
      url: `${SITE_URL}/projects`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: `${SITE_URL}/projects/${p.slug}` })),
      },
    },
  ],
})

const route = useRoute()
const router = useRouter()

// Filters live in the URL (?q=&status=&type=) so filtered views can be shared.
function queryRef(key) {
  return computed({
    get: () => (typeof route.query[key] === 'string' ? route.query[key] : ''),
    set: (v) => router.replace({ query: { ...route.query, [key]: v || undefined } }),
  })
}
const q = queryRef('q')
const status = queryRef('status')
const type = queryRef('type')

const order = { 'in-progress': 0, live: 1, completed: 2 }
const sorted = [...projects].sort((a, b) => order[a.status] - order[b.status])

// Full-text search (MiniSearch, async): slug -> rank of the current query's matches.
const rank = ref(null)
let requestId = 0
watch(
  q,
  async (text) => {
    const id = ++requestId
    if (!text.trim()) return (rank.value = null)
    const hits = await search(text, { kind: 'app' })
    if (id === requestId) rank.value = new Map(hits.map((h, i) => [h.slug, i]))
  },
  { immediate: true },
)

function matches(p, { s = status.value, t = type.value } = {}) {
  return (!rank.value || rank.value.has(p.slug)) && (!s || p.status === s) && (!t || p.type === t)
}

// With a search query, most relevant first; otherwise in-progress → live → completed.
const filtered = computed(() => {
  const list = sorted.filter((p) => matches(p))
  return rank.value ? list.sort((a, b) => rank.value.get(a.slug) - rank.value.get(b.slug)) : list
})
// Only offer status filters that at least one app has (e.g. no "Completed 0" pill).
const usedStatuses = Object.fromEntries(Object.entries(statuses).filter(([key]) => projects.some((p) => p.status === key)))
const statusCount = (s) => projects.filter((p) => matches(p, { s })).length
const typeCount = (t) => projects.filter((p) => matches(p, { t })).length
const hasFilters = computed(() => q.value || status.value || type.value)

function clear() {
  router.replace({ query: {} })
}

const pill = (on) =>
  on
    ? 'bg-brand-gradient text-white shadow-md shadow-brand-500/25'
    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-400 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
</script>

<template>
  <div class="container-page py-16 sm:py-20">
    <SectionHeading
      as="h1"
      v-reveal
      eyebrow="// projects"
      title="Apps I've built"
      subtitle="Android apps live on Google Play, finished builds and what I'm working on right now."
    />

    <div class="card mb-10 space-y-5 p-5 sm:p-6">
      <label class="relative block">
        <span class="sr-only">Search projects</span>
        <AppIcon name="search" class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
        <input
          v-model.trim="q"
          type="search"
          placeholder="Search by app, feature or tech — try “Compose”, “dialer”, “PDF”…"
          class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-4 pl-12 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 w-14 text-xs font-semibold tracking-wide text-slate-500 uppercase">Status</span>
        <button class="rounded-full px-3.5 py-1.5 text-sm font-medium transition" :class="pill(!status)" @click="status = ''">All</button>
        <button
          v-for="(meta, key) in usedStatuses"
          :key="key"
          class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
          :class="pill(status === key)"
          @click="status = status === key ? '' : key"
        >
          {{ meta.label }} <span class="ml-1 opacity-70">{{ statusCount(key) }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 w-14 text-xs font-semibold tracking-wide text-slate-500 uppercase">Type</span>
        <button class="rounded-full px-3.5 py-1.5 text-sm font-medium transition" :class="pill(!type)" @click="type = ''">All</button>
        <button
          v-for="t in types"
          :key="t"
          class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
          :class="pill(type === t)"
          @click="type = type === t ? '' : t"
        >
          {{ t }} <span class="ml-1 opacity-70">{{ typeCount(t) }}</span>
        </button>
      </div>
    </div>

    <div class="mb-5 flex items-center justify-between text-sm text-slate-500">
      <p>Showing <strong class="text-slate-900 dark:text-white">{{ filtered.length }}</strong> of {{ projects.length }} projects</p>
      <button v-if="hasFilters" class="font-medium text-brand-600 hover:underline dark:text-brand-400" @click="clear">Clear filters</button>
    </div>

    <TransitionGroup tag="div" name="page" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="p in filtered" :key="p.slug" :project="p" />
    </TransitionGroup>

    <div v-if="!filtered.length" class="card py-16 text-center">
      <p class="text-lg font-semibold text-slate-900 dark:text-white">No apps match those filters</p>
      <p class="mt-1 text-slate-500">Try a different search or clear the filters.</p>
      <button class="btn-primary mt-6" @click="clear">Clear filters</button>
    </div>
  </div>
</template>
