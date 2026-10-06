<script setup>
import { computed, ref } from 'vue'
import { getProject, statuses } from '../../data/portfolio'
import AppIcon from '../AppIcon.vue'

// "Find your app in two taps" (blog: find-ravi-sorathiya-android-developer).
// Every answer maps to a real app; the pairing follows each app's own summary.
const steps = [
  {
    id: 'calls',
    label: 'Calls',
    icon: '📞',
    ask: 'What matters most on a call?',
    picks: [
      { label: 'Block spam, theme my calls', slug: 'phone-call' },
      { label: 'Big caller ID and speed dial', slug: 'phone-caller-contacts' },
      { label: 'Contacts first, custom call screen', slug: 'contacts-dialer' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: '💬',
    ask: 'How do you text?',
    picks: [
      { label: 'A fresh, modern SMS app', slug: 'messages-compose' },
      { label: 'Schedule, block and back up texts', slug: 'messages-sms' },
      { label: 'All my social apps in one hub', slug: 'messenger-all-social' },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: '🖼️',
    ask: 'What do you do with photos?',
    picks: [
      { label: 'Scroll a fast timeline and edit', slug: 'gallery-pro' },
      { label: 'Albums and a video player', slug: 'gallery-photo-album' },
      { label: 'Lock the private ones away', slug: 'gallery-locker' },
      { label: 'Turn them into music videos', slug: 'noys-music-video-maker' },
    ],
  },
  {
    id: 'work',
    label: 'Getting things done',
    icon: '⏰',
    ask: 'What needs sorting out?',
    picks: [
      { label: 'Holidays, events and widgets', slug: 'calendar-2026' },
      { label: 'Actually waking up on time', slug: 'alarm-clock' },
      { label: 'Reading, signing and editing PDFs', slug: 'pdf-reader' },
      { label: 'Recording audio', slug: 'voice-recorder' },
    ],
  },
]

const area = ref(null)
const slug = ref(null)
const step = computed(() => (slug.value ? 2 : area.value ? 1 : 0))
const current = computed(() => steps.find((s) => s.id === area.value))
const app = computed(() => slug.value && getProject(slug.value))

function restart() {
  area.value = null
  slug.value = null
}
</script>

<template>
  <figure class="not-prose card relative my-12 overflow-hidden">
    <div class="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />
    <div class="relative p-5 sm:p-6">
      <div class="flex items-center justify-between gap-3">
        <figcaption>
          <p class="font-mono text-xs text-brand-600 dark:text-brand-400">// two taps</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Find your app</p>
        </figcaption>
        <!-- Progress -->
        <div class="flex items-center gap-1.5" aria-hidden="true">
          <span v-for="i in 3" :key="i" class="h-1.5 rounded-full transition-all duration-300" :class="i - 1 <= step ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'" />
        </div>
      </div>

      <div class="mt-5 min-h-[14rem]" aria-live="polite">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-x-4 opacity-0"
          leave-active-class="transition duration-150"
          leave-to-class="-translate-x-4 opacity-0"
        >
          <!-- Step 1 -->
          <div v-if="step === 0" key="s0">
            <p class="text-sm text-slate-600 dark:text-slate-300">What do you do most on your phone?</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                v-for="s in steps"
                :key="s.id"
                type="button"
                class="group rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/10 dark:border-slate-800"
                @click="area = s.id"
              >
                <span class="block text-2xl transition group-hover:scale-110" aria-hidden="true">{{ s.icon }}</span>
                <span class="mt-2 block text-sm font-semibold text-slate-900 dark:text-white">{{ s.label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="step === 1" key="s1">
            <button type="button" class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600" @click="area = null">
              <AppIcon name="back" class="size-3.5" /> {{ current.icon }} {{ current.label }}
            </button>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ current.ask }}</p>
            <div class="mt-3 grid gap-2">
              <button
                v-for="p in current.picks"
                :key="p.slug"
                type="button"
                class="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-brand-400 hover:bg-brand-500/5 dark:border-slate-800 dark:text-slate-100"
                @click="slug = p.slug"
              >
                {{ p.label }}
                <AppIcon name="arrow" class="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-500" />
              </button>
            </div>
          </div>

          <!-- Result -->
          <div v-else key="s2" class="text-center">
            <p class="text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">Your match</p>
            <img :src="app.icon" alt="" width="80" height="80" class="mx-auto mt-3 size-20 rounded-3xl shadow-xl shadow-brand-500/20" />
            <p class="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{{ app.title }}</p>
            <p class="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">{{ app.summary }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ statuses[app.status].label }}</p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <RouterLink :to="`/projects/${app.slug}`" class="btn-primary px-4! py-2! text-sm">Read the case study</RouterLink>
              <a v-if="app.playUrl" :href="app.playUrl" target="_blank" rel="noopener" class="btn-ghost px-4! py-2! text-sm">Google Play ↗</a>
            </div>
            <button type="button" class="mt-4 text-xs text-slate-500 underline decoration-dotted hover:text-brand-600" @click="restart">Start over</button>
          </div>
        </Transition>
      </div>
    </div>
  </figure>
</template>
