<script setup>
// /open-source: my open-source tools (data in src/data/oss.js). One card per tool.
import AppIcon from '../components/AppIcon.vue'
import SectionHeading from '../components/SectionHeading.vue'
import ArtisanTerminal from '../components/oss/ArtisanTerminal.vue'
import { useSeo } from '../composables/seo'
import { SITE_URL } from '../data/portfolio'
import { artisan, ossTools } from '../data/oss'

useSeo({
  title: 'Open source',
  description: 'Open-source developer tools by Ravi Sorathiya for Android and Kotlin developers, free and MIT-licensed.',
  path: '/open-source',
  image: '/og/oss/kotlin-artisan.png',
  jsonLd: [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Open source', item: `${SITE_URL}/open-source` },
      ],
    },
  ],
})
</script>

<template>
  <section class="py-14 sm:py-20">
    <div class="container-page">
      <SectionHeading as="h1" eyebrow="// open source" title="Tools I build in the open" subtitle="Free, MIT-licensed tools for Android and Kotlin developers. Born from chores in my own projects." />

      <article
        v-for="t in ossTools"
        :key="t.slug"
        v-reveal
        class="grid items-center gap-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] dark:from-violet-950/40 dark:via-slate-900 dark:to-emerald-950/30"
      >
        <div class="min-w-0">
          <p class="flex flex-wrap gap-2 font-mono text-xs">
            <span class="rounded-full bg-violet-100 px-2.5 py-1 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">CLI</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">v{{ t.version }}</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ t.license }}</span>
          </p>
          <h2 class="mt-4 font-mono text-3xl font-bold tracking-tight">
            <RouterLink :to="t.path" class="hover:underline"><span class="text-brand-600 dark:text-brand-400">$</span> {{ t.name }}</RouterLink>
          </h2>
          <p class="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t.tagline }}</p>
          <p class="mt-2 text-slate-600 dark:text-slate-400">{{ t.summary }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink :to="t.path" class="btn-primary">See what it does <AppIcon name="arrow" class="size-4" /></RouterLink>
            <a :href="t.repo" target="_blank" rel="noopener" class="btn-ghost"><AppIcon name="github" class="size-4" /> GitHub</a>
          </div>
        </div>
        <ArtisanTerminal v-if="t.slug === artisan.slug" compact class="min-w-0" />
      </article>
    </div>
  </section>
</template>
