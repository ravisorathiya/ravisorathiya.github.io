<script setup>
import { computed } from 'vue'
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import NavBar from './components/NavBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import BottomTabBar from './components/BottomTabBar.vue'
import CommandPalette from './components/CommandPalette.vue'
import StarField from './components/StarField.vue'
import { paletteOpen } from './composables/palette'

const { y } = useWindowScroll()
const { height } = useWindowSize()
const progress = computed(() => {
  if (typeof document === 'undefined') return 0
  const max = document.documentElement.scrollHeight - height.value
  return max > 0 ? Math.min(1, y.value / max) : 0
})
</script>

<template>
  <div class="flex min-h-screen flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
    <StarField />
    <div
      class="bg-brand-gradient fixed top-0 left-0 z-50 h-0.5 w-full origin-left"
      :style="{ transform: `scaleX(${progress})` }"
      aria-hidden="true"
    />
    <NavBar />
    <main class="flex-1">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter />
    <BottomTabBar />
    <CommandPalette v-model="paletteOpen" />
  </div>
</template>
