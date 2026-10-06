<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { onKeyStroke, useScrollLock, watchDebounced } from '@vueuse/core'
import { nav, posts, projects } from '../data/portfolio'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import { highlight, preloadSearch, search } from '../utils/search'

const open = defineModel({ type: Boolean, default: false })
const router = useRouter()
const query = ref('')
const active = ref(0)
const input = ref(null)
const locked = useScrollLock(typeof document !== 'undefined' ? document.body : null)

const GROUPS = [
  { kind: 'page', label: 'Pages' },
  { kind: 'app', label: 'Apps' },
  { kind: 'post', label: 'Articles' },
  { kind: 'section', label: 'Sections' },
]
const projectBySlug = new Map(projects.map((p) => [p.slug, p]))
const postBySlug = new Map(posts.map((p) => [p.slug, p]))

// Shape every result the same way, enriched with icon/status/hint for display.
function decorate(r) {
  if (r.kind === 'app') {
    const p = projectBySlug.get(r.slug)
    return { ...r, icon: p?.icon, status: p?.status, hint: r.snippet || p?.type }
  }
  if (r.kind === 'post') return { ...r, hint: r.snippet || postBySlug.get(r.slug)?.description, icon: null }
  if (r.kind === 'section') return { ...r, hint: r.snippet, icon: r.parent === 'app' ? projectBySlug.get(r.slug)?.icon : null }
  return { ...r, hint: 'Page' }
}

// Default list (empty query): pages, apps, then articles.
const defaults = [
  ...nav.map((n) => ({ id: `page:${n.to}`, kind: 'page', title: n.label, to: n.to })),
  ...projects.map((p) => ({ id: `app:${p.slug}`, kind: 'app', slug: p.slug, title: p.title, to: `/projects/${p.slug}` })),
  ...posts.map((p) => ({ id: `post:${p.slug}`, kind: 'post', slug: p.slug, title: p.title, to: `/blog/${p.slug}` })),
].map(decorate)

const hits = ref(null) // null = no query
const loading = ref(false)
let requestId = 0

watchDebounced(
  query,
  async (q) => {
    const id = ++requestId
    if (!q.trim()) {
      hits.value = null
      return
    }
    loading.value = true
    const res = await search(q)
    if (id !== requestId) return // a newer query is in flight
    hits.value = res.map(decorate)
    loading.value = false
  },
  { debounce: 80 },
)

// Results grouped by kind (best match first within each group), flattened for keyboard nav.
const groups = computed(() => {
  const list = hits.value ?? defaults
  const out = GROUPS.map((g) => ({ ...g, items: list.filter((r) => r.kind === g.kind) })).filter((g) => g.items.length)
  // With a query, the group holding the best match comes first.
  if (hits.value) out.sort((a, b) => (b.items[0].score ?? 0) - (a.items[0].score ?? 0))
  return out
})
const flat = computed(() => groups.value.flatMap((g) => g.items))
const indexOf = (r) => flat.value.indexOf(r)

watch(flat, () => (active.value = 0))
// Keep the highlighted row visible while arrowing through a long list.
watch(active, async (i) => {
  await nextTick()
  document.getElementById(`palette-item-${i}`)?.scrollIntoView({ block: 'nearest' })
})
watch(open, async (v) => {
  locked.value = v
  if (v) {
    query.value = ''
    hits.value = null
    preloadSearch()
    await nextTick()
    input.value?.focus()
  }
})

onKeyStroke(['k', 'K'], (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    open.value = !open.value
  }
})
onKeyStroke('Escape', () => (open.value = false))

function go(entry) {
  if (!entry) return
  open.value = false
  router.push(entry.to)
}

function onKey(e) {
  const n = Math.max(flat.value.length, 1)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = (active.value + 1) % n
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = (active.value - 1 + n) % n
  } else if (e.key === 'Enter') {
    if (query.value.trim() && (hits.value === null || loading.value)) {
      // Typed fast and hit Enter before results arrived: wait for them.
      e.preventDefault()
      const q = query.value
      search(q).then((res) => {
        if (q === query.value && res.length) go(decorate(res[0]))
      })
      return
    }
    go(flat.value[active.value])
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-sm" @click.self="open = false">
        <div class="card w-full max-w-xl overflow-hidden shadow-2xl" role="dialog" aria-modal="true" aria-label="Search">
          <div class="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
            <AppIcon name="search" class="size-5 text-slate-400" />
            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Search apps, articles, tech…"
              class="h-14 flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
              @keydown="onKey"
            />
            <kbd class="rounded border border-slate-300 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700">ESC</kbd>
          </div>
          <div class="max-h-[60vh] overflow-y-auto p-2">
            <section v-for="g in groups" :key="g.kind" class="mb-1">
              <p class="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{{ g.label }}</p>
              <ul>
                <li v-for="r in g.items" :key="r.id">
                  <button
                    :id="`palette-item-${indexOf(r)}`"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left"
                    :class="indexOf(r) === active ? 'bg-brand-50 dark:bg-brand-500/10' : ''"
                    @mouseenter="active = indexOf(r)"
                    @click="go(r)"
                  >
                    <img v-if="r.icon" :src="r.icon" alt="" class="size-8 shrink-0 rounded-lg" />
                    <span v-else class="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                      <AppIcon :name="r.kind === 'post' ? 'layers' : r.kind === 'section' ? 'menu' : 'arrow'" class="size-4" />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span v-if="r.parentTitle" class="block truncate text-[11px] text-slate-400">{{ r.parentTitle }} ›</span>
                      <span class="block truncate font-medium text-slate-900 dark:text-white">
                        <template v-for="(part, i) in highlight(r.title, r.terms)" :key="i"><mark v-if="part.match" class="rounded-sm bg-brand-500/20 text-inherit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                      <span class="block truncate text-xs text-slate-500">
                        <template v-for="(part, i) in highlight(r.hint, r.terms)" :key="i"><mark v-if="part.match" class="rounded-sm bg-brand-500/15 font-medium text-slate-700 dark:text-slate-200">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                      </span>
                    </span>
                    <StatusBadge v-if="r.status" :status="r.status" />
                  </button>
                </li>
              </ul>
            </section>
            <p v-if="hits && !hits.length && !loading" class="px-3 py-8 text-center text-sm text-slate-500">No results for “{{ query }}”</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
