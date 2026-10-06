<script setup>
import { computed } from 'vue'
import { liveCount, posts, profile, projects, skills, socials, stats } from '../data/portfolio'
import AppIcon from '../components/AppIcon.vue'
import CountUp from '../components/CountUp.vue'
import IconMarquee from '../components/IconMarquee.vue'
import ProjectCard from '../components/ProjectCard.vue'
import SectionHeading from '../components/SectionHeading.vue'
import SkillBadge from '../components/SkillBadge.vue'
import PostCard from '../components/PostCard.vue'
import TypeWriter from '../components/TypeWriter.vue'
import { paletteOpen } from '../composables/palette'
import { personSchema, useSeo } from '../composables/seo'
import { SITE_URL } from '../data/portfolio'

useSeo({
  description:
    `Ravi Sorathiya is an Android developer building Kotlin & Jetpack Compose apps — ${liveCount} apps live on Google Play including phone dialers, SMS messengers, galleries, a video maker and a PDF editor.`,
  jsonLd: [
    personSchema,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: `${profile.name} — Portfolio`,
      publisher: { '@id': personSchema['@id'] },
    },
  ],
})

const featured = computed(() => projects.filter((p) => p.featured))
const flagship = projects.find((p) => p.slug === 'pdf-reader')
const topSkills = computed(() => skills.flatMap((g) => g.items).slice(0, 18))
const heroIcons = projects.filter((p) => p.icon && p.status === 'live').slice(0, 9)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div class="absolute -top-32 left-1/2 h-[30rem] w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl dark:bg-emerald-500/15" />
        <div class="absolute top-40 -right-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
        <div
          class="absolute inset-0 bg-[radial-gradient(#10b98122_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]"
        />
      </div>

      <div class="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.3fr_1fr]">
        <div v-reveal>
          <p
            v-if="profile.availableForWork"
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
          >
            <span class="size-2 animate-pulse rounded-full bg-emerald-500" /> Available for work
          </p>
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hi, I'm <span class="text-gradient">{{ profile.name }}</span>
          </h1>
          <p class="mt-4 h-8 font-mono text-lg text-slate-600 sm:text-xl dark:text-slate-400">
            <TypeWriter :words="profile.roles" />
          </p>
          <p class="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">{{ profile.tagline }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink to="/projects" class="btn-primary">
              Explore my apps <AppIcon name="arrow" class="size-4" />
            </RouterLink>
            <button class="btn-ghost" @click="paletteOpen = true">
              <AppIcon name="search" class="size-4" /> Quick search
            </button>
          </div>
          <div class="mt-8 flex items-center gap-2">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="me noopener"
              :aria-label="s.name"
              :title="s.name"
              class="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-brand-400"
            >
              <AppIcon :name="s.icon" class="size-5" />
            </a>
          </div>
        </div>

        <!-- Phone-style icon grid -->
        <div v-reveal="150" class="mx-auto w-full max-w-[18rem]">
          <div class="relative rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-emerald-900/30 dark:border-slate-700">
            <div class="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-700" />
            <div class="bg-brand-gradient overflow-hidden rounded-[1.8rem] px-5 pt-12 pb-8">
              <p class="text-center font-mono text-xs text-white/80">My apps on Google Play</p>
              <div class="mt-5 grid grid-cols-3 gap-4">
                <RouterLink
                  v-for="(p, i) in heroIcons"
                  :key="p.slug"
                  :to="`/projects/${p.slug}`"
                  class="group flex flex-col items-center gap-1.5"
                  :style="{ animationDelay: `${i * 80}ms` }"
                >
                  <img :src="p.icon" :alt="p.title" class="size-14 rounded-2xl shadow-lg ring-2 ring-white/30 transition duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                  <span class="w-full truncate text-center text-[10px] font-medium text-white">{{ p.title.split(' - ')[0] }}</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container-page pb-16">
        <dl class="grid grid-cols-3 gap-3 sm:gap-4">
          <div v-for="(s, i) in stats" :key="s.label" v-reveal="i * 100" class="card p-4 text-center sm:p-6">
            <dd class="text-gradient text-3xl font-extrabold sm:text-5xl"><CountUp :value="s.value" /></dd>
            <dt class="mt-1 text-xs text-slate-500 sm:text-sm">{{ s.label }}</dt>
          </div>
        </dl>
      </div>
    </section>

    <!-- Icon marquee -->
    <section class="border-y border-slate-200 bg-slate-50/70 py-6 dark:border-slate-800 dark:bg-slate-900/40">
      <IconMarquee />
    </section>

    <!-- Featured projects -->
    <section class="py-20">
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading v-reveal eyebrow="// featured" title="Selected work" subtitle="A few apps I'm most proud of — from a full PDF editor to system-level dialers." />
          <RouterLink to="/projects" class="btn-ghost mb-10">All {{ projects.length }} projects</RouterLink>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(p, i) in featured" :key="p.slug" v-reveal="i * 100" class="flex">
            <ProjectCard :project="p" class="w-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- Flagship spotlight -->
    <section v-if="flagship" class="pb-20">
      <div class="container-page">
        <div v-reveal class="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 sm:p-12 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/40">
          <div class="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
            <img :src="flagship.icon" :alt="flagship.title" class="size-28 rounded-3xl shadow-xl sm:size-36" />
            <div>
              <p class="font-mono text-sm text-amber-600 dark:text-amber-400">// currently building</p>
              <h2 class="mt-2 text-3xl font-bold sm:text-4xl">{{ flagship.title }}</h2>
              <p class="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">{{ flagship.summary }}</p>
              <ul class="mt-6 grid gap-2 sm:grid-cols-2">
                <li v-for="f in flagship.features.slice(0, 6)" :key="f" class="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <AppIcon name="check" class="mt-0.5 size-4 shrink-0 text-brand-500" /> {{ f }}
                </li>
              </ul>
              <RouterLink :to="`/projects/${flagship.slug}`" class="btn-primary mt-8">
                See how it's built <AppIcon name="arrow" class="size-4" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest notes -->
    <section v-if="posts.length" class="pb-20">
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading v-reveal eyebrow="// dev notes" title="Latest notes" subtitle="How I build things: deep dives from real apps." />
          <RouterLink to="/blog" class="btn-ghost mb-10">All notes</RouterLink>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="(p, i) in posts.slice(0, 3)" :key="p.slug" v-reveal="i * 100" class="flex">
            <PostCard :post="p" class="w-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- About teaser -->
    <section class="border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div class="container-page grid gap-10 lg:grid-cols-2">
        <div v-reveal>
          <SectionHeading eyebrow="// about" title="A little about me" />
          <p class="text-lg leading-relaxed text-slate-600 dark:text-slate-400">{{ profile.shortBio }}</p>
          <RouterLink to="/about" class="mt-6 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-400">
            More about me <AppIcon name="arrow" class="size-4" />
          </RouterLink>
        </div>
        <div v-reveal="150">
          <p class="mb-4 font-mono text-sm text-slate-500">Tech I work with</p>
          <div class="flex flex-wrap gap-2">
            <RouterLink v-for="s in topSkills" :key="s" :to="{ path: '/projects', query: { q: s } }">
              <SkillBadge :label="s" class="transition hover:bg-brand-100 dark:hover:bg-brand-500/20" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20">
      <div class="container-page">
        <div v-reveal class="bg-brand-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
          <div class="absolute -top-20 -left-20 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div class="absolute -right-16 -bottom-24 size-72 rounded-full bg-lime-300/20 blur-2xl" aria-hidden="true" />
          <h2 class="relative text-3xl font-bold !text-white sm:text-4xl">Let's build your next Android app</h2>
          <p class="relative mx-auto mt-4 max-w-xl text-emerald-50">
            Have a project in mind or want to work together? My inbox is always open.
          </p>
          <RouterLink to="/contact" class="btn relative mt-8 bg-white text-emerald-700 hover:bg-emerald-50">
            Contact me <AppIcon name="arrow" class="size-4" />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
