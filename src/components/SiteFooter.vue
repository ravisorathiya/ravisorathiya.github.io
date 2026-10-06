<script setup>
import { ref } from 'vue'
import { profile, socials } from '../data/portfolio'
import AppIcon from './AppIcon.vue'
import SupportDialog from './SupportDialog.vue'

const year = new Date().getFullYear()
const supportOpen = ref(false)
</script>

<template>
  <footer class="border-t border-slate-200 py-8 dark:border-slate-800">
    <div class="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p class="text-sm text-slate-500">© {{ year }} {{ profile.name }}. Built with Vue &amp; Tailwind.</p>
      <div class="flex items-center gap-2">
        <button
          class="mr-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-amber-400 hover:text-amber-500 dark:border-slate-800"
          @click="supportOpen = true"
        >
          <AppIcon name="heart" class="size-4" /> Support
        </button>
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="me noopener"
          :aria-label="s.name"
          :title="s.name"
          class="grid size-9 place-items-center rounded-md text-slate-500 transition hover:text-brand-600 dark:hover:text-brand-400"
        >
          <AppIcon :name="s.icon" class="size-5" />
        </a>
      </div>
    </div>
    <SupportDialog v-model="supportOpen" />
  </footer>
</template>
