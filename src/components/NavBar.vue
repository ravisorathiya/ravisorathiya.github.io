<script setup>
import { useRoute } from 'vue-router'
import { useDark, useToggle, useWindowScroll } from '@vueuse/core'
import { nav, profile } from '../data/portfolio'
import AppIcon from './AppIcon.vue'
import { paletteOpen } from '../composables/palette'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const { y } = useWindowScroll()
const route = useRoute()

const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-colors"
    :class="y > 8
      ? 'border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85'
      : 'border-transparent bg-transparent'"
  >
    <nav class="container-page flex h-16 items-center justify-between">
      <RouterLink to="/" class="font-mono text-lg font-semibold text-slate-900 dark:text-white">
        {{ profile.name.split(' ')[0].toLowerCase() }}<span class="text-brand-500">.dev</span>
      </RouterLink>

      <div class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          :class="{ '!text-brand-600 dark:!text-brand-400': isActive(item.to) }"
        >
          {{ item.label }}
        </RouterLink>
        <button
          class="ml-3 flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-brand-400"
          aria-label="Search projects"
          @click="paletteOpen = true"
        >
          <AppIcon name="search" class="size-4" /> Search
          <kbd class="rounded border border-slate-300 px-1 font-mono text-[10px] dark:border-slate-700">Ctrl K</kbd>
        </button>
        <button
          class="ml-2 grid size-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" class="size-5" />
        </button>
      </div>

      <div class="flex items-center gap-1 md:hidden">
        <button
          class="grid size-10 place-items-center rounded-md text-slate-600 dark:text-slate-400"
          aria-label="Search projects"
          @click="paletteOpen = true"
        >
          <AppIcon name="search" class="size-5" />
        </button>
        <button
          class="grid size-10 place-items-center rounded-md text-slate-600 dark:text-slate-400"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" class="size-5" />
        </button>
      </div>
    </nav>
    <!-- On mobile the page links live in the bottom tab bar (BottomTabBar.vue). -->
  </header>
</template>
