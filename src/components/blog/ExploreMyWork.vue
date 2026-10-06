<script setup>
import { computed, ref } from 'vue'
import { getPost, getProject } from '../../content'
import AppIcon from '../AppIcon.vue'

// Interest → app → article (blog: find-ravi-sorathiya-android-developer).
// App and article details are read from the content files.
const paths = [
  {
    name: 'Polished interfaces',
    skill: 'Jetpack Compose',
    icon: 'sparkle',
    intro: 'From a message thread to a photo timeline: Compose in apps built for everyday use.',
    apps: ['messages-compose', 'gallery-pro'],
    article: 'shipping-android-apps-template-remote-config-baseline-profiles',
  },
  {
    name: 'Deep platform work',
    skill: 'Telephony & system roles',
    icon: 'android',
    intro: 'Apps that take over core phone roles, from handling calls to screening incoming numbers.',
    apps: ['phone-call', 'phone-caller-contacts'],
    article: 'android-dialer-incallservice-callscreeningservice',
  },
  {
    name: 'A tricky editing problem',
    skill: 'Kotlin + pdf.js',
    icon: 'code',
    intro: 'Where a native Android app meets a web-powered PDF editor, and how they talk.',
    apps: ['pdf-reader'],
    article: 'pdf-editor-pdfjs-webview-android',
  },
]

const selected = ref(0)
const active = computed(() => {
  const p = paths[selected.value]
  return { ...p, apps: p.apps.map((slug) => ({ slug, ...getProject(slug) })), article: { slug: p.article, ...getPost(p.article) } }
})

// Arrow keys move between the interest cards (radio-group pattern).
function onKey(e) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!step) return
  e.preventDefault()
  selected.value = (selected.value + step + paths.length) % paths.length
  e.currentTarget.querySelectorAll('[role=radio]')[selected.value]?.focus()
}
</script>

<template>
  <section class="not-prose card my-10 overflow-hidden" aria-label="Find your path through my Android work">
    <div class="p-5 sm:p-6">
      <p class="font-mono text-xs text-brand-600 dark:text-brand-400">interest → app → under the hood</p>
      <h3 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">What would you like to explore?</h3>

      <div class="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Interests" @keydown="onKey">
        <button
          v-for="(p, i) in paths"
          :key="p.name"
          type="button"
          role="radio"
          :aria-checked="selected === i"
          :tabindex="selected === i ? 0 : -1"
          class="group relative rounded-xl border p-4 text-left transition"
          :class="selected === i
            ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
            : 'border-slate-200 hover:-translate-y-0.5 hover:border-brand-400 dark:border-slate-800'"
          @click="selected = i"
        >
          <span
            class="grid size-9 place-items-center rounded-lg transition"
            :class="selected === i ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'"
          >
            <AppIcon :name="p.icon" class="size-5" />
          </span>
          <span class="mt-3 block text-sm font-semibold text-slate-900 dark:text-white">{{ p.name }}</span>
          <span class="block text-xs text-slate-500">{{ p.skill }}</span>
        </button>
      </div>
    </div>

    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <ol :key="selected" class="relative border-t border-slate-200 bg-slate-50/60 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40" aria-live="polite">
        <span class="absolute top-12 bottom-14 left-[2.05rem] w-px bg-gradient-to-b from-brand-500 to-transparent sm:left-[2.3rem]" aria-hidden="true" />

        <li class="relative flex gap-4">
          <span class="z-10 grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient font-mono text-[11px] font-bold text-white">1</span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Meet the app</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ active.intro }}</p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <RouterLink
                v-for="a in active.apps"
                :key="a.slug"
                :to="`/projects/${a.slug}`"
                class="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <img :src="a.icon" alt="" width="44" height="44" loading="lazy" class="size-11 shrink-0 rounded-xl transition group-hover:scale-105" />
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{{ a.title }}</span>
                  <span class="mt-0.5 block text-xs leading-relaxed text-slate-500">{{ a.summary }}</span>
                </span>
              </RouterLink>
            </div>
          </div>
        </li>

        <li class="relative mt-6 flex gap-4">
          <span class="z-10 grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient font-mono text-[11px] font-bold text-white">2</span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Go under the hood</p>
            <RouterLink
              :to="`/blog/${active.article.slug}`"
              class="group mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><AppIcon name="layers" class="size-5" /></span>
              <span class="min-w-0 flex-1 text-sm font-medium text-slate-900 dark:text-white">{{ active.article.title }}</span>
              <AppIcon name="arrow" class="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-500" />
            </RouterLink>
          </div>
        </li>

        <li class="relative mt-6 flex gap-4">
          <span class="z-10 grid size-6 shrink-0 place-items-center rounded-full border border-brand-500 bg-white font-mono text-[11px] font-bold text-brand-600 dark:bg-slate-900 dark:text-brand-400">3</span>
          <div class="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
            <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Have something in mind?</p>
            <RouterLink to="/contact" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Let's talk about your Android project <AppIcon name="arrow" class="size-4" />
            </RouterLink>
          </div>
        </li>
      </ol>
    </Transition>
  </section>
</template>
