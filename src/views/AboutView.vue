<script setup>
import { computed, ref } from 'vue'
import { education, experience, liveCount, profile, projects, skills } from '../data/portfolio'
import AppIcon from '../components/AppIcon.vue'
import SectionHeading from '../components/SectionHeading.vue'
import StatusBadge from '../components/StatusBadge.vue'
import CareerJourney from '../components/CareerJourney.vue'
import { personSchema, useSeo } from '../composables/seo'

useSeo({
  title: 'About — Android Developer (Kotlin, Jetpack Compose)',
  description: `About ${profile.name}: Android developer skilled in Kotlin, Jetpack Compose, Hilt, Room, CameraX and Firebase, with ${liveCount} apps shipped to Google Play.`,
  path: '/about',
  type: 'profile',
  jsonLd: [{ '@type': 'ProfilePage', mainEntity: personSchema }],
})

// Tech explorer: pick a skill to see which apps use it.
const usage = (skill) => projects.filter((p) => p.tags.includes(skill))
const selected = ref('Jetpack Compose')
const selectedProjects = computed(() => usage(selected.value))
</script>

<template>
  <div class="container-page py-16 sm:py-20">
    <section class="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div v-reveal>
        <SectionHeading as="h1" eyebrow="// about" title="About me" />
        <div class="space-y-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          <p v-for="(para, i) in profile.bio" :key="i">{{ para }}</p>
        </div>
      </div>
      <aside v-reveal="150" class="card h-fit p-6">
        <dl class="space-y-4 text-sm">
          <div>
            <dt class="text-slate-500">Role</dt>
            <dd class="font-medium text-slate-900 dark:text-white">{{ profile.role }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Location</dt>
            <dd class="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
              <AppIcon name="pin" class="size-4" /> {{ profile.location }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">Email</dt>
            <dd>
              <a :href="`mailto:${profile.email}`" class="font-medium text-brand-600 hover:underline dark:text-brand-400">{{ profile.email }}</a>
            </dd>
          </div>
        </dl>
        <a v-if="profile.resumeUrl" :href="profile.resumeUrl" target="_blank" class="btn-primary mt-6 w-full justify-center">
          <AppIcon name="download" class="size-4" /> Download resume
        </a>
        <RouterLink v-else to="/projects" class="btn-primary mt-6 w-full justify-center">
          See my apps <AppIcon name="arrow" class="size-4" />
        </RouterLink>
      </aside>
    </section>

    <section class="mt-20">
      <SectionHeading v-reveal eyebrow="// skills" title="Tech explorer" subtitle="Click any technology to see the apps I've used it in." />
      <div class="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="(g, i) in skills" :key="g.group" v-reveal="(i % 2) * 100" class="card p-5">
            <h3 class="mb-3 text-sm font-semibold">{{ g.group }}</h3>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="s in g.items"
                :key="s"
                class="rounded-full px-2.5 py-1 text-xs font-medium transition"
                :class="selected === s
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20'"
                @click="selected = s"
              >
                {{ s }}
                <span v-if="usage(s).length" class="ml-0.5 opacity-60">{{ usage(s).length }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="lg:sticky lg:top-24 lg:self-start">
          <div class="card p-6">
            <p class="font-mono text-xs text-slate-500">selected</p>
            <h3 class="text-gradient mt-1 text-2xl font-bold">{{ selected }}</h3>
            <p class="mt-1 text-sm text-slate-500">
              Used in {{ selectedProjects.length }} {{ selectedProjects.length === 1 ? 'app' : 'apps' }}
            </p>
            <TransitionGroup tag="ul" name="page" class="mt-5 space-y-2">
              <li v-for="p in selectedProjects" :key="p.slug">
                <RouterLink
                  :to="`/projects/${p.slug}`"
                  class="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <img v-if="p.icon" :src="p.icon" alt="" class="size-10 rounded-xl" />
                  <span class="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{{ p.title }}</span>
                  <StatusBadge :status="p.status" />
                </RouterLink>
              </li>
            </TransitionGroup>
            <p v-if="!selectedProjects.length" class="mt-5 text-sm text-slate-500">
              A general skill I use across projects rather than tied to one app.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-20">
      <SectionHeading
        v-reveal
        eyebrow="// journey"
        title="Career journey"
        subtitle="From a BCA in 2016 to shipping Android apps on Google Play. Hover or tap any bar to jump to that chapter."
      />
      <CareerJourney :experience="experience" :education="education" :live-count="liveCount" />
    </section>
  </div>
</template>
