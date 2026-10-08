<script setup>
import { computed, ref } from 'vue'
import { profile, projects } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'

// A store-style phone search over the live apps (blog: find-ravi-sorathiya-android-developer).
// Only real data: titles, icons, Play developer accounts, summaries and features from content/.
// No ratings or download counts, because those would be made up.
const live = projects.filter((p) => p.status === 'live')
const types = ['All', ...new Set(live.map((p) => p.type))]

const query = ref('')
const type = ref('All')
const open = ref(null) // the app shown in the bottom sheet

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return live.filter(
    (p) =>
      (type.value === 'All' || p.type === type.value) &&
      (!q || [p.title, p.summary, p.type, ...p.tags].join(' ').toLowerCase().includes(q)),
  )
})
</script>

<template>
  <figure class="not-prose my-12">
    <div class="grid items-center gap-8 md:grid-cols-[1fr_17.5rem]">
      <figcaption class="order-2 md:order-1">
        <p class="font-mono text-xs text-brand-600 dark:text-brand-400">// on the phone</p>
        <p class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Search the shelf like a store</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Every app here is live on Google Play. Filter by category, search a feature like <button type="button" class="font-mono text-brand-600 underline decoration-dotted dark:text-brand-400" @click="query = 'spam'">spam</button>
          or <button type="button" class="font-mono text-brand-600 underline decoration-dotted dark:text-brand-400" @click="query = 'Compose'">Compose</button>,
          then tap an app to open its card.
        </p>
        <p class="mt-4 text-xs text-slate-500">A styled mockup, with no store ratings or install counts.</p>
      </figcaption>

      <!-- Phone -->
      <div class="order-1 mx-auto w-full max-w-[17.5rem] md:order-2">
        <div class="relative rounded-[2.6rem] border-[9px] border-slate-900 bg-slate-900 shadow-2xl shadow-brand-900/30 ring-1 ring-slate-700 dark:border-slate-800">
          <div class="absolute top-2 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-800" aria-hidden="true" />
          <div class="relative h-[34rem] overflow-hidden rounded-[2rem] bg-white dark:bg-[#131316]">
            <!-- Status bar -->
            <div class="flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300" aria-hidden="true">
              <span>9:41</span>
              <span class="flex items-center gap-1"><span class="h-2 w-3 rounded-sm border border-current" /><span>5G</span></span>
            </div>

            <!-- Search -->
            <div class="px-3 pt-4">
              <label class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-[#26262b]">
                <AppIcon name="search" class="size-4 shrink-0 text-slate-500" />
                <input
                  v-model="query"
                  type="text"
                  placeholder="Search Ravi's apps"
                  aria-label="Search apps"
                  class="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-500 dark:text-white"
                />
                <button v-if="query" type="button" aria-label="Clear search" class="text-slate-400" @click="query = ''">
                  <AppIcon name="close" class="size-3.5" />
                </button>
                <img v-if="profile.avatar" :src="profile.avatar" alt="" width="24" height="24" class="size-6 shrink-0 rounded-full object-cover" aria-hidden="true" />
                <span v-else class="grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-[9px] font-bold text-white" aria-hidden="true">RS</span>
              </label>
            </div>

            <!-- Category chips -->
            <div class="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-3 pb-1">
              <button
                v-for="t in types"
                :key="t"
                type="button"
                :aria-pressed="type === t"
                class="shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition"
                :class="type === t
                  ? 'border-transparent bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200'
                  : 'border-slate-200 text-slate-600 dark:border-[#3a3a40] dark:text-slate-300'"
                @click="type = t"
              >
                {{ t }}
              </button>
            </div>

            <!-- App list -->
            <TransitionGroup
              tag="ul"
              class="h-[25.5rem] space-y-0.5 overflow-y-auto px-2 pt-2 pb-6"
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="translate-x-3 opacity-0"
              leave-active-class="absolute opacity-0 transition duration-100"
              move-class="transition duration-300"
            >
              <li v-for="p in shown" :key="p.slug">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-slate-50 active:scale-[0.98] dark:hover:bg-white/5"
                  @click="open = p"
                >
                  <img :src="p.icon" alt="" width="48" height="48" loading="lazy" class="size-12 shrink-0 rounded-[0.9rem] shadow-sm" />
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-[13px] font-medium text-slate-900 dark:text-white">{{ p.title }}</span>
                    <span class="block truncate text-[11px] text-slate-500 dark:text-slate-400">{{ p.developer || 'Ravi Sorathiya' }}</span>
                    <span class="block truncate text-[11px] text-slate-400 dark:text-slate-500">{{ p.type }}</span>
                  </span>
                  <span class="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-brand-700 dark:border-[#3a3a40] dark:text-brand-300">View</span>
                </button>
              </li>
              <li v-if="!shown.length" key="none" class="px-4 pt-10 text-center text-xs text-slate-500">
                Nothing for “{{ query }}”.<br />
                <button type="button" class="mt-2 text-brand-600 underline dark:text-brand-400" @click="(query = ''), (type = 'All')">Show all apps</button>
              </li>
            </TransitionGroup>

            <!-- Bottom sheet -->
            <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
              <div v-if="open" class="absolute inset-0 z-10 bg-slate-950/40" @click="open = null" />
            </Transition>
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="translate-y-full"
              leave-active-class="transition duration-200 ease-in"
              leave-to-class="translate-y-full"
            >
              <div v-if="open" class="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-white p-4 pb-5 shadow-2xl dark:bg-[#1d1d22]" role="dialog" :aria-label="open.title">
                <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                <div class="flex items-center gap-3">
                  <img :src="open.icon" alt="" width="56" height="56" class="size-14 rounded-2xl shadow" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ open.title }}</p>
                    <a v-if="open.developerUrl" :href="open.developerUrl" target="_blank" rel="noopener" class="block truncate text-[11px] text-brand-700 dark:text-brand-300">{{ open.developer }}</a>
                    <p class="text-[11px] text-slate-500">{{ open.type }}</p>
                  </div>
                </div>
                <p class="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{{ open.summary }}</p>
                <ul v-if="open.features?.length" class="mt-2 space-y-1">
                  <li v-for="f in open.features.slice(0, 3)" :key="f" class="flex gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <AppIcon name="check" class="mt-px size-3 shrink-0 text-brand-500" />{{ f }}
                  </li>
                </ul>
                <div class="mt-4 grid grid-cols-2 gap-2">
                  <RouterLink :to="`/projects/${open.slug}`" class="rounded-full bg-brand-gradient py-2 text-center text-xs font-semibold text-white">Case study</RouterLink>
                  <a :href="open.playUrl" target="_blank" rel="noopener" class="rounded-full border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 dark:border-[#3a3a40] dark:text-slate-200">Google Play ↗</a>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </figure>
</template>
