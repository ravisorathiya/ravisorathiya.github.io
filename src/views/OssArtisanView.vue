<script setup>
// Landing page for kotlin-artisan, my open-source CLI for Android projects.
// All content comes from src/data/oss.js (facts from the tool's README + real captured output).
import AppIcon from '../components/AppIcon.vue'
import SectionHeading from '../components/SectionHeading.vue'
import ArtisanTerminal from '../components/oss/ArtisanTerminal.vue'
import CommandExplorer from '../components/oss/CommandExplorer.vue'
import InstallTabs from '../components/oss/InstallTabs.vue'
import { personSchema, useSeo } from '../composables/seo'
import { profile, SITE_URL } from '../data/portfolio'
import { artisan } from '../data/oss'

const url = SITE_URL + artisan.path

useSeo({
  title: 'kotlin-artisan: an artisan-style CLI for Android projects',
  description: 'Open-source Kotlin CLI for Android devs: one word to install the build, switch the phone to dark mode, find missing translations or open Crashlytics.',
  path: artisan.path,
  image: '/og/oss/kotlin-artisan.png',
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: artisan.name,
      description: artisan.summary,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Windows, macOS, Linux',
      softwareVersion: artisan.version,
      license: 'https://opensource.org/licenses/MIT',
      downloadUrl: artisan.releases,
      codeRepository: artisan.repo,
      programmingLanguage: 'Kotlin',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': personSchema['@id'], '@type': 'Person', name: profile.name },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: artisan.name, item: url },
      ],
    },
  ],
})

// Screenshot lightbox (PhotoSwipe), loaded on first click only (same as ScreenshotGallery).
async function zoom(index) {
  const [{ default: PhotoSwipe }] = await Promise.all([import('photoswipe'), import('photoswipe/style.css')])
  new PhotoSwipe({
    dataSource: artisan.shots.map((s) => ({ src: s.src, width: s.width * 2, height: s.height * 2, alt: s.alt })),
    index,
    bgOpacity: 0.92,
    showHideAnimationType: 'fade',
    paddingFn: () => ({ top: 30, bottom: 30, left: 16, right: 16 }),
  }).init()
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-100/60 to-transparent dark:from-violet-950/30" aria-hidden="true" />
      <div class="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div class="min-w-0">
          <p class="inline-flex flex-wrap items-center gap-2 font-mono text-xs">
            <span class="rounded-full bg-violet-100 px-2.5 py-1 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">open source</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">v{{ artisan.version }}</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ artisan.license }}</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Windows · macOS · Linux</span>
          </p>
          <h1 class="mt-5 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
            <span class="text-brand-600 dark:text-brand-400">$</span> {{ artisan.name }}
          </h1>
          <p class="mt-4 text-xl font-semibold text-slate-800 sm:text-2xl dark:text-slate-100">{{ artisan.tagline }}</p>
          <p class="mt-3 text-lg text-slate-600 dark:text-slate-400">{{ artisan.summary }}</p>
          <InstallTabs class="mt-7" />
          <p class="mt-2 text-xs text-slate-500">{{ artisan.requirements }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a :href="artisan.repo" target="_blank" rel="noopener" class="btn-primary">
              <AppIcon name="github" class="size-4" /> View on GitHub
            </a>
            <a :href="artisan.releases" target="_blank" rel="noopener" class="btn-ghost">
              <AppIcon name="download" class="size-4" /> Releases
            </a>
          </div>
        </div>
        <ArtisanTerminal class="min-w-0" />
      </div>
    </section>

    <!-- Why -->
    <section class="border-y border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
      <div class="container-page grid gap-6 md:grid-cols-3">
        <div v-for="(pt, i) in artisan.points" :key="pt.title" v-reveal="i * 100">
          <p class="font-mono text-sm text-brand-600 dark:text-brand-400">0{{ i + 1 }}</p>
          <h2 class="mt-1 text-lg font-bold">{{ pt.title }}</h2>
          <p class="mt-1 text-slate-600 dark:text-slate-400">{{ pt.text }}</p>
        </div>
      </div>
    </section>

    <!-- Use cases -->
    <section class="py-20">
      <div class="container-page">
        <SectionHeading v-reveal eyebrow="// use it for" title="Chores you do every day, now one word" subtitle="What I use it for on real Android projects." />
        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="(u, i) in artisan.useCases"
            :key="u.title"
            v-reveal="(i % 2) * 100"
            class="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div class="flex items-center gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <AppIcon :name="u.icon" class="size-5" />
              </span>
              <h3 class="text-lg font-bold">{{ u.title }}</h3>
            </div>
            <p class="mt-3 text-slate-600 dark:text-slate-400">{{ u.problem }}</p>
            <pre class="no-scrollbar mt-4 overflow-x-auto rounded-xl bg-[#0b1220] p-4 font-mono text-xs leading-relaxed text-slate-200"><template v-for="c in u.cmds" :key="c"><span class="text-violet-400 select-none">$ </span>{{ c }}
</template></pre>
          </article>
        </div>
      </div>
    </section>

    <!-- Real screenshots -->
    <section class="pb-20">
      <div class="container-page">
        <SectionHeading v-reveal eyebrow="// real output" title="What it looks like" subtitle="Captured from a real run on my Messages app (paths and the device serial masked). Tap to zoom." />
        <div class="grid gap-6 lg:grid-cols-2">
          <a
            v-for="(s, i) in artisan.shots"
            :key="s.src"
            :href="s.src"
            target="_blank"
            class="group block min-w-0 overflow-hidden rounded-2xl shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:ring-slate-800"
            @click.prevent="zoom(i)"
          >
            <img :src="s.src" :alt="s.alt" :width="s.width" :height="s.height" loading="lazy" class="block h-auto w-full" />
          </a>
        </div>
      </div>
    </section>

    <!-- Commands -->
    <section class="border-y border-slate-200 bg-slate-50/70 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div class="container-page">
        <SectionHeading v-reveal eyebrow="// commands" title="Every command" subtitle="Leave out an argument and artisan asks or shows a picker. Type a group (artisan app) to pick from it." />
        <CommandExplorer v-reveal="100" />
      </div>
    </section>

    <!-- Config + notes -->
    <section class="py-20">
      <div class="container-page grid gap-10 lg:grid-cols-2">
        <div v-reveal class="min-w-0">
          <SectionHeading eyebrow="// artisan.json" title="Optional config, your own commands" subtitle="artisan init writes what it detected. Every key is optional; custom commands show up in the pickers." />
          <pre class="no-scrollbar overflow-x-auto rounded-2xl bg-[#0b1220] p-5 font-mono text-xs leading-relaxed text-slate-200 sm:text-[13px]">{{ artisan.config }}</pre>
        </div>
        <div v-reveal="150" class="min-w-0">
          <SectionHeading eyebrow="// notes workspace" title="Memory for teams and AI agents" subtitle="artisan init notes creates plain-markdown versions → phases → bugs, plans and screenshots that make:, list: and check: keep tidy." />
          <pre class="no-scrollbar overflow-x-auto rounded-2xl bg-[#0b1220] p-5 font-mono text-xs leading-relaxed text-slate-200 sm:text-[13px]"><template v-for="t in artisan.notesTree" :key="t[0]"><span :class="t[0].trim().endsWith('/') ? 'text-cyan-300' : ''">{{ t[0].padEnd(30) }}</span><span class="text-slate-500">{{ t[1] }}</span>
</template></pre>
          <div class="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <p class="font-semibold">Always up to date</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              <code class="font-mono text-brand-700 dark:text-brand-300">artisan self:update</code> installs the latest release. A once-a-day check tells you when one is out. It stays quiet offline and on CI.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="pb-20">
      <div class="container-page">
        <div v-reveal class="relative overflow-hidden rounded-3xl bg-[#0b1220] px-6 py-14 text-center text-white sm:px-12">
          <div class="absolute -top-20 -left-20 size-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div class="absolute -right-16 -bottom-24 size-72 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />
          <p class="relative font-mono text-sm text-emerald-300">$ artisan doctor → All good.</p>
          <h2 class="relative mt-3 text-3xl font-bold !text-white sm:text-4xl">Try it on your project</h2>
          <p class="relative mx-auto mt-4 max-w-xl text-slate-300">
            Free and MIT-licensed. If it saves you a few clicks, a GitHub star helps other Android devs find it. Issues and PRs are welcome.
          </p>
          <div class="relative mt-8 flex flex-wrap justify-center gap-3">
            <a :href="artisan.repo" target="_blank" rel="noopener" class="btn bg-white text-slate-900 hover:bg-slate-100">
              <AppIcon name="star" class="size-4" /> Star on GitHub
            </a>
            <a :href="`${artisan.repo}/issues`" target="_blank" rel="noopener" class="btn border border-white/20 text-white hover:bg-white/10">
              Report an issue <AppIcon name="external" class="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
