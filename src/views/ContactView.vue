<script setup>
import { reactive, ref } from 'vue'
import { profile, socials, support } from '../data/portfolio'
import AppIcon from '../components/AppIcon.vue'
import Avatar3D from '../components/Avatar3D.vue'
import SectionHeading from '../components/SectionHeading.vue'
import SupportDialog from '../components/SupportDialog.vue'
import { personSchema, useSeo } from '../composables/seo'

useSeo({
  title: 'Contact — Hire an Android Developer',
  description: 'Get in touch with Ravi Sorathiya for Android app development in Kotlin and Jetpack Compose — by email, on X or Instagram.',
  path: '/contact',
  jsonLd: [{ '@type': 'ContactPage', mainEntity: personSchema }],
})

// GitHub Pages is static, so the form opens the visitor's mail client.
// To receive submissions directly, swap this for a service like Formspree.
const form = reactive({ name: '', email: '', message: '' })
const supportOpen = ref(false)

function send() {
  const subject = encodeURIComponent(`Portfolio contact from ${form.name}`)
  const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
}

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white'
</script>

<template>
  <div class="container-page py-16 sm:py-20">
    <div class="grid gap-12 lg:grid-cols-2">
      <div>
        <Avatar3D size="lg" orbit class="mb-8 lg:ml-0" />
        <SectionHeading
          as="h1"
          eyebrow="// contact"
          title="Get in touch"
          subtitle="Need an Android app built, a role filled, or have a question about one of my apps? Send me a message."
        />
        <a
          :href="`mailto:${profile.email}`"
          class="card flex items-center gap-4 p-5 transition hover:border-brand-400"
        >
          <span class="grid size-11 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <AppIcon name="mail" class="size-5" />
          </span>
          <span>
            <span class="block text-sm text-slate-500">Email</span>
            <span class="font-medium text-slate-900 dark:text-white">{{ profile.email }}</span>
          </span>
        </a>
        <div class="mt-6 flex gap-2">
          <a
            v-for="s in socials"
            :key="s.name"
            :href="s.url"
            target="_blank"
            rel="me noopener"
            :aria-label="s.name"
            :title="s.name"
            class="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-brand-400"
          >
            <AppIcon :name="s.icon" class="size-5" />
          </a>
        </div>

        <button
          class="card group mt-8 flex w-full items-center gap-4 p-5 text-left transition hover:border-amber-400"
          @click="supportOpen = true"
        >
          <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-500">
            <AppIcon name="heart" class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-slate-900 dark:text-white">Support my work</span>
            <span class="block text-sm text-slate-500">Tip in crypto via {{ support.label }} · scan a QR</span>
          </span>
          <AppIcon name="arrow" class="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
        </button>
        <SupportDialog v-model="supportOpen" />
      </div>

      <form class="card space-y-5 p-6 sm:p-8" @submit.prevent="send">
        <div>
          <label for="name" class="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Name</label>
          <input id="name" v-model="form.name" required :class="input" placeholder="Your name" />
        </div>
        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Email</label>
          <input id="email" v-model="form.email" type="email" required :class="input" placeholder="you@example.com" />
        </div>
        <div>
          <label for="message" class="mb-1.5 block text-sm font-medium text-slate-900 dark:text-white">Message</label>
          <textarea id="message" v-model="form.message" required rows="5" :class="input" placeholder="Tell me about your project..." />
        </div>
        <button type="submit" class="btn-primary w-full justify-center">
          Send message <AppIcon name="arrow" class="size-4" />
        </button>
      </form>
    </div>
  </div>
</template>
