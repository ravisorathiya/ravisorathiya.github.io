<script setup>
// A tiny, clickable mock of what the Jetpack Compose snippet renders
// (MediaFilterBar + MediaGrid), like Android Studio's interactive preview.
// Emits the code line a tap "runs", so the showcase can highlight it.
import { computed, ref } from 'vue'

const emit = defineEmits(['line'])

const types = [
  { id: 'all', label: 'All' },
  { id: 'photo', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'fav', label: 'Favorites' },
]
const hues = ['from-emerald-400 to-teal-600', 'from-sky-400 to-indigo-500', 'from-amber-300 to-orange-500', 'from-fuchsia-400 to-purple-600', 'from-lime-300 to-emerald-500', 'from-rose-300 to-pink-500']
const items = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  type: i % 3 === 1 ? 'video' : 'photo',
  fav: i % 4 === 0,
  hue: hues[(i * 5) % hues.length],
  duration: `0:${String(12 + ((i * 7) % 47)).padStart(2, '0')}`,
}))

const selected = ref('all')
const visible = computed(() =>
  items.filter((m) => selected.value === 'all' || (selected.value === 'fav' ? m.fav : m.type === selected.value)),
)

function select(id) {
  selected.value = id
  emit('line', 14) // onClick = { onSelect(type) }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[16rem] rounded-[2rem] border-[7px] border-slate-900 bg-slate-900 shadow-xl shadow-emerald-900/20 dark:border-slate-700">
    <div class="overflow-hidden rounded-[1.5rem] bg-white dark:bg-slate-950">
      <div class="flex items-center justify-between px-4 pt-2.5 pb-1 text-[9px] font-semibold text-slate-500">
        <span>9:41</span><span class="h-3.5 w-14 rounded-full bg-slate-900 dark:bg-slate-700" /><span>100%</span>
      </div>
      <p class="px-4 pt-1 text-sm font-bold text-slate-900 dark:text-white">Gallery</p>
      <div class="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5" role="group" aria-label="Media filter (interactive preview)">
        <button
          v-for="t in types"
          :key="t.id"
          type="button"
          :aria-pressed="selected === t.id"
          class="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition active:scale-95"
          :class="
            selected === t.id
              ? 'border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-100'
              : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          @click="select(t.id)"
        >
          <svg v-if="selected === t.id" viewBox="0 0 24 24" class="size-3" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          {{ t.label }}
        </button>
      </div>
      <TransitionGroup tag="div" name="tile" class="relative grid h-[13.5rem] grid-cols-3 content-start gap-1 overflow-hidden px-1 pb-1">
        <div v-for="m in visible" :key="m.id" class="relative aspect-square rounded-md bg-gradient-to-br" :class="m.hue">
          <span v-if="m.type === 'video'" class="absolute right-1 bottom-1 flex items-center gap-0.5 rounded bg-black/45 px-1 text-[8px] font-medium text-white">
            <svg viewBox="0 0 24 24" class="size-2" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>{{ m.duration }}
          </span>
          <svg v-if="m.fav" viewBox="0 0 24 24" class="absolute top-1 right-1 size-3 text-white drop-shadow" fill="currentColor" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.4 4.5 7 4.5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.6 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21Z" />
          </svg>
        </div>
      </TransitionGroup>
      <p class="border-t border-slate-200 px-4 py-2 text-center text-[10px] text-slate-500 dark:border-slate-800">
        {{ visible.length }} items · state.filter = <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ types.find((t) => t.id === selected).label }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.tile-move,
.tile-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.tile-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
/* Filtered-out tiles vanish at once; the rest glide into place. */
.tile-leave-active {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .tile-move,
  .tile-enter-active {
    transition: none;
  }
}
</style>
