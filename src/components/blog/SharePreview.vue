<script setup>
import { computed, ref } from 'vue'
import { getPost, getProject, profile, SITE_URL, socials, statuses } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'

// How a link to the site unfurls in X, WhatsApp and Slack (blog: find-ravi-sorathiya-android-developer).
// Title, description and image follow the same rules as useSeo() and scripts/og.mjs,
// so each preview matches the page's real Open Graph tags.
const SITE_NAME = `${profile.name} — Portfolio`
const DOMAIN = new URL(SITE_URL).host
const withName = (t) => `${t} | ${profile.name}`

const projectPage = (slug) => {
  const p = getProject(slug)
  return {
    label: p.title,
    path: `/projects/${slug}`,
    title: withName(`${p.title} — Android App (${p.type})`),
    description: `${p.summary} ${p.playUrl ? 'Available on Google Play.' : statuses[p.status].label + '.'} Built with ${p.tags.slice(0, 4).join(', ')}.`,
    image: `/og/projects/${slug}.png`,
    note: 'Just shipped a new case study:',
  }
}
const postPage = (slug) => {
  const p = getPost(slug)
  return { label: 'PDF article', path: `/blog/${slug}`, title: withName(p.title), description: p.description, image: `/og/blog/${slug}.png`, note: 'Wrote up how this works:' }
}

const pages = [
  {
    label: 'Portfolio',
    path: '/',
    title: `${profile.name} — ${profile.role} | Kotlin & Jetpack Compose Apps`,
    description: profile.shortBio,
    image: '/og/default.png',
    note: 'My Android work, all in one place:',
  },
  projectPage('phone-call'),
  postPage('pdf-editor-pdfjs-webview-android'),
]
const platforms = [
  { id: 'x', label: 'X' },
  { id: 'chat', label: 'WhatsApp' },
  { id: 'slack', label: 'Slack' },
]

const pageIndex = ref(0)
const platform = ref('x')
const page = computed(() => pages[pageIndex.value])
const url = computed(() => SITE_URL + page.value.path)
const image = computed(() => SITE_URL + page.value.image)
const xHandle = '@' + new URL(socials.find((s) => s.icon === 'x').url).pathname.split('/').filter(Boolean)[0]

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // Clipboard blocked: the link is still visible in the preview.
  }
}
</script>

<template>
  <figure class="not-prose card my-12 overflow-hidden">
    <div class="flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
      <figcaption>
        <p class="font-mono text-xs text-brand-600 dark:text-brand-400">// share it</p>
        <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">One link, every chat</p>
        <p class="mt-1 max-w-md text-sm text-slate-500">Each page brings its own title, summary and share image. Pick a page and an app to see the preview.</p>
      </figcaption>

      <!-- Segmented platform switch -->
      <div class="relative grid grid-cols-3 rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800" role="tablist" aria-label="Where it's shared">
        <span
          class="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-white shadow transition-transform duration-300 dark:bg-slate-950"
          :style="{ transform: `translateX(${platforms.findIndex((p) => p.id === platform) * 100}%)` }"
          aria-hidden="true"
        />
        <button
          v-for="p in platforms"
          :key="p.id"
          type="button"
          role="tab"
          :aria-selected="platform === p.id"
          class="relative px-4 py-1.5 transition"
          :class="platform === p.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'"
          @click="platform = p.id"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5 px-5 sm:px-6">
      <button
        v-for="(p, i) in pages"
        :key="p.path"
        type="button"
        :aria-pressed="pageIndex === i"
        class="rounded-full border px-3 py-1 text-xs transition"
        :class="pageIndex === i ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-400'"
        @click="pageIndex = i"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Stage -->
    <div class="mt-5 border-t border-slate-200 dark:border-slate-800">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="scale-[0.98] opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0"
      >
        <!-- X -->
        <div v-if="platform === 'x'" :key="'x' + pageIndex" class="bg-white p-5 sm:p-6 dark:bg-black">
          <div class="mx-auto flex max-w-lg gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">RS</span>
            <div class="min-w-0 flex-1">
              <p class="text-sm">
                <span class="font-bold text-slate-900 dark:text-[#e7e9ea]">{{ profile.name }}</span>
                <span class="ml-1 text-slate-500 dark:text-[#71767b]">{{ xHandle }} · now</span>
              </p>
              <p class="mt-0.5 text-sm text-slate-900 dark:text-[#e7e9ea]">{{ page.note }}</p>
              <a :href="url" target="_blank" rel="noopener" class="group relative mt-3 block overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2f3336]">
                <img :src="image" alt="" width="1200" height="630" loading="lazy" class="aspect-[1200/630] w-full bg-slate-100 object-cover transition duration-500 group-hover:scale-[1.02] dark:bg-[#16181c]" />
                <span class="absolute bottom-3 left-3 max-w-[85%] truncate rounded bg-black/70 px-1.5 py-0.5 text-[13px] text-white">{{ page.title }}</span>
              </a>
              <p class="mt-1 text-xs text-slate-500 dark:text-[#71767b]">From {{ DOMAIN }}</p>
              <div class="mt-3 flex max-w-xs justify-between text-slate-400 dark:text-[#71767b]" aria-hidden="true">
                <AppIcon name="mail" class="size-4" /><AppIcon name="layers" class="size-4" /><AppIcon name="heart" class="size-4" /><AppIcon name="external" class="size-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- WhatsApp-style chat -->
        <div
          v-else-if="platform === 'chat'"
          :key="'c' + pageIndex"
          class="bg-[#efeae2] bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:14px_14px] p-5 sm:p-6 dark:bg-[#0b141a] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]"
        >
          <div class="mx-auto max-w-lg space-y-2">
            <p class="mx-auto w-fit rounded-lg bg-white/80 px-2.5 py-0.5 text-[11px] text-slate-500 shadow-sm dark:bg-[#182229] dark:text-[#8696a0]">Today</p>
            <div class="mr-10 w-fit rounded-lg rounded-tl-none bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm dark:bg-[#202c33] dark:text-[#e9edef]">
              Do you know an Android dev? 👀<span class="ml-2 align-bottom text-[10px] text-slate-400">9:40</span>
            </div>
            <div class="ml-auto w-[min(100%,22rem)] rounded-lg rounded-tr-none bg-[#d9fdd3] p-1 shadow-sm dark:bg-[#005c4b]">
              <a :href="url" target="_blank" rel="noopener" class="block overflow-hidden rounded-md bg-black/5 dark:bg-black/20">
                <img :src="image" alt="" width="1200" height="630" loading="lazy" class="aspect-[1200/630] w-full object-cover" />
                <span class="block px-2.5 py-2">
                  <span class="line-clamp-2 block text-[13px] font-semibold text-slate-900 dark:text-[#e9edef]">{{ page.title }}</span>
                  <span class="mt-0.5 line-clamp-2 block text-xs text-slate-600 dark:text-[#d1d7db]/80">{{ page.description }}</span>
                  <span class="mt-1 block text-[11px] text-slate-500 dark:text-[#d1d7db]/60">{{ DOMAIN }}</span>
                </span>
              </a>
              <p class="px-1.5 pt-1 pb-0.5 text-sm break-all text-slate-800 dark:text-[#e9edef]">
                {{ page.note }} <span class="text-[#027eb5] underline dark:text-[#53bdeb]">{{ url }}</span>
                <span class="float-right mt-1.5 ml-2 text-[10px] text-slate-500 dark:text-[#d1d7db]/60">9:41 <span class="text-[#53bdeb]">✓✓</span></span>
              </p>
            </div>
          </div>
        </div>

        <!-- Slack-style unfurl -->
        <div v-else :key="'s' + pageIndex" class="bg-white p-5 sm:p-6 dark:bg-[#1a1d21]">
          <div class="mx-auto flex max-w-lg gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-white">RS</span>
            <div class="min-w-0 flex-1">
              <p class="text-sm">
                <span class="font-bold text-slate-900 dark:text-[#d1d2d3]">{{ profile.name }}</span>
                <span class="ml-1.5 text-xs text-slate-500 dark:text-[#ababad]">9:41 AM</span>
              </p>
              <p class="text-sm text-slate-800 dark:text-[#d1d2d3]">{{ page.note }} <a :href="url" target="_blank" rel="noopener" class="break-all text-[#1264a3] hover:underline dark:text-[#1d9bd1]">{{ url }}</a></p>
              <div class="mt-2 border-l-4 border-slate-300 pl-3 dark:border-[#35373b]">
                <p class="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-[#d1d2d3]">
                  <span class="grid size-4 place-items-center rounded bg-brand-gradient text-[7px] text-white">RS</span>{{ SITE_NAME }}
                </p>
                <a :href="url" target="_blank" rel="noopener" class="mt-1 block text-sm font-bold text-[#1264a3] hover:underline dark:text-[#1d9bd1]">{{ page.title }}</a>
                <p class="mt-0.5 line-clamp-3 text-sm text-slate-700 dark:text-[#d1d2d3]">{{ page.description }}</p>
                <img :src="image" alt="" width="1200" height="630" loading="lazy" class="mt-2 aspect-[1200/630] w-full max-w-sm rounded-lg border border-slate-200 object-cover dark:border-[#35373b]" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 sm:px-6 dark:border-slate-800">
      <code class="min-w-0 truncate font-mono text-xs text-slate-500">{{ url }}</code>
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
        :class="copied ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'"
        @click="copy"
      >
        <AppIcon :name="copied ? 'check' : 'copy'" class="size-3.5" /> {{ copied ? 'Copied' : 'Copy link' }}
      </button>
    </div>
  </figure>
</template>
