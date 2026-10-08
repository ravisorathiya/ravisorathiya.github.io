<script setup>
// Home-page "How I build" showcase (Laravel-style): a list of modern-Android
// techniques beside an editor window. Each is a short Shiki-highlighted snippet
// (content/snippets/*.md). Lines with a note are tappable; the note bar steps
// through them. All panels are pre-rendered (v-show) so the code is in the static
// HTML; DOM work happens only after mount (SSR-safe).
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { snippets } from '../data/portfolio'
import AppIcon from './AppIcon.vue'
import ComposeFilterPreview from './showcase/ComposeFilterPreview.vue'
import SnippetDetails from './showcase/SnippetDetails.vue'

const previews = { 'compose-filter': ComposeFilterPreview }

const active = ref(0)
const noteIdx = ref(0)
const copied = ref(false)
const tabEls = ref([])
const codeEls = ref([])

const current = computed(() => snippets[active.value])
const note = computed(() => current.value.notes[noteIdx.value])
const preview = computed(() => previews[current.value.preview])

function select(i, focus = false) {
  const n = snippets.length
  active.value = (i + n) % n
  noteIdx.value = 0
  copied.value = false
  const tab = tabEls.value[active.value]
  if (focus) tab?.focus()
  tab?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}

function onTabKey(e) {
  const next = active.value + 1
  const prev = active.value - 1
  const moves = { ArrowRight: next, ArrowDown: next, ArrowLeft: prev, ArrowUp: prev, Home: 0, End: snippets.length - 1 }
  if (!(e.key in moves)) return
  e.preventDefault()
  select(moves[e.key], true)
}

function stepNote(d) {
  const n = current.value.notes.length
  if (n) noteIdx.value = (noteIdx.value + d + n) % n
}

function showLine(line) {
  const i = current.value.notes.findIndex((x) => x.line === line)
  if (i >= 0) noteIdx.value = i
}

function onCodeClick(e) {
  const el = e.target.closest?.('.line.has-note')
  if (el) noteIdx.value = Number(el.dataset.note)
}

async function copy() {
  const text = codeEls.value[active.value]?.querySelector('code')?.innerText ?? ''
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* clipboard blocked: nothing to do */
  }
}

// Marks noted lines (once) and the currently explained one.
function paint() {
  codeEls.value.forEach((el, s) => {
    if (!el) return
    const lines = el.querySelectorAll('.line')
    snippets[s].notes.forEach((n, i) => {
      const line = lines[n.line - 1]
      if (!line) return
      line.classList.add('has-note')
      line.dataset.note = i
      line.classList.toggle('is-active', s === active.value && i === noteIdx.value)
    })
  })
}

onMounted(paint)
watch([active, noteIdx], () => nextTick(paint))
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
    <!-- Technique list: underlined strip on phones, vertical list (Laravel-style) on desktop -->
    <div class="min-w-0">
      <div
        role="tablist"
        aria-label="Modern Android techniques"
        class="no-scrollbar -mx-4 flex overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:border-b-0 dark:border-slate-800"
        @keydown="onTabKey"
      >
        <div v-for="(s, i) in snippets" :key="s.slug" role="presentation" class="shrink-0">
          <button
            :id="`snippet-tab-${s.slug}`"
            :ref="(el) => (tabEls[i] = el)"
            role="tab"
            type="button"
            :aria-selected="i === active"
            :aria-controls="`snippet-panel-${s.slug}`"
            :tabindex="i === active ? 0 : -1"
            class="-mb-px block border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition lg:mb-0 lg:w-full lg:border-b-0 lg:border-l-2 lg:px-5 lg:text-left lg:text-base"
            :class="
              i === active
                ? 'border-brand-500 font-semibold text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 lg:border-slate-200 dark:text-slate-400 dark:hover:text-white lg:dark:border-slate-800'
            "
            @click="select(i)"
          >
            {{ s.title }}
          </button>
          <!-- Desktop: the active item opens to show its description -->
          <div v-if="i === active" class="details-in hidden border-l-2 border-brand-500 px-5 pb-4 lg:block">
            <SnippetDetails :snippet="s" />
          </div>
        </div>
      </div>
      <!-- Phones: description under the strip -->
      <SnippetDetails :key="current.slug" :snippet="current" class="details-in mt-4 lg:hidden" />
    </div>

    <!-- Editor window -->
    <div class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
      <div class="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <span class="flex gap-1.5" aria-hidden="true">
          <span class="size-3 rounded-full bg-red-400" /><span class="size-3 rounded-full bg-amber-400" /><span class="size-3 rounded-full bg-emerald-400" />
        </span>
        <span class="flex min-w-0 items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
          <AppIcon name="code" class="size-3.5 shrink-0 text-brand-500" />
          <span class="truncate">{{ current.file }}</span>
        </span>
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          :aria-label="copied ? 'Copied' : 'Copy code'"
          @click="copy"
        >
          <AppIcon :name="copied ? 'check' : 'copy'" class="size-3.5" /> {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>

      <div class="grid flex-1" :class="preview ? 'xl:grid-cols-[minmax(0,1fr)_17rem]' : ''">
        <div class="code min-h-[22rem] min-w-0" @click="onCodeClick">
          <div
            v-for="(s, i) in snippets"
            v-show="i === active"
            :id="`snippet-panel-${s.slug}`"
            :key="s.slug"
            :ref="(el) => (codeEls[i] = el)"
            role="tabpanel"
            :aria-labelledby="`snippet-tab-${s.slug}`"
            class="panel"
          >
            <component :is="s.Body" />
          </div>
        </div>
        <!-- Split "Preview" pane, like Android Studio -->
        <div v-if="preview" class="border-t border-slate-200 bg-slate-50/70 p-4 xl:border-t-0 xl:border-l dark:border-slate-800 dark:bg-slate-900/50">
          <p class="mb-3 flex items-center gap-1.5 font-mono text-xs text-brand-600 dark:text-brand-400">
            <span class="size-1.5 animate-pulse rounded-full bg-brand-500" /> Preview: tap a chip
          </p>
          <component :is="preview" @line="showLine" />
        </div>
      </div>

      <!-- Note bar: explains the highlighted line -->
      <div v-if="note" class="flex items-start gap-3 border-t border-emerald-500/20 bg-emerald-50/80 px-4 py-3 dark:bg-emerald-500/10">
        <span class="mt-0.5 shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">L{{ note.line }}</span>
        <p class="min-h-10 flex-1 text-sm leading-snug text-slate-700 dark:text-slate-200" aria-live="polite">{{ note.text }}</p>
        <div class="flex shrink-0 items-center gap-1">
          <button type="button" class="note-btn" aria-label="Previous note" @click="stepNote(-1)">
            <AppIcon name="back" class="size-3.5" />
          </button>
          <span class="w-8 text-center font-mono text-[11px] text-slate-500">{{ noteIdx + 1 }}/{{ current.notes.length }}</span>
          <button type="button" class="note-btn" aria-label="Next note" @click="stepNote(1)">
            <AppIcon name="arrow" class="size-3.5" />
          </button>
        </div>
      </div>
    </div>

    <p class="text-xs text-slate-500 lg:col-start-2 lg:-mt-6">
      Tap a highlighted line to see why it's there. These are simplified samples of patterns from my apps, not their actual source code.
    </p>
  </div>
</template>

<style scoped>
.note-btn {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  color: rgb(100 116 139);
  transition: background-color 0.15s, color 0.15s;
}
.note-btn:hover {
  background-color: rgb(16 185 129 / 0.15);
  color: var(--color-brand-600);
}

.code :deep(pre) {
  margin: 0;
  padding: 1rem 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
}
/* Let the window colour show instead of Shiki's theme background. */
.code :deep(.shiki),
.code :deep(.shiki span) {
  background-color: transparent;
}
.code :deep(code) {
  counter-reset: line;
}
.code :deep(.shiki .line) {
  display: inline-block;
  min-width: 100%;
  padding-right: 1rem;
  border-left: 3px solid transparent;
}
.code :deep(.shiki .line)::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 2.25rem;
  margin-right: 1rem;
  text-align: right;
  color: rgb(148 163 184 / 0.7);
}
.code :deep(.shiki .line.has-note) {
  cursor: pointer;
  background-color: rgb(16 185 129 / 0.07);
  border-left-color: rgb(16 185 129 / 0.35);
}
.code :deep(.shiki .line.has-note:hover) {
  background-color: rgb(16 185 129 / 0.14);
}
.code :deep(.shiki .line.is-active) {
  background-color: rgb(16 185 129 / 0.2);
  border-left-color: var(--color-brand-500);
  animation: line-pulse 0.5s ease;
}
.code :deep(.shiki .line.is-active)::before {
  color: var(--color-brand-500);
  font-weight: 600;
}
.panel,
.details-in {
  animation: panel-in 0.25s ease;
}
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
@keyframes line-pulse {
  from {
    background-color: rgb(16 185 129 / 0.4);
  }
}
@media (prefers-reduced-motion: reduce) {
  .panel,
  .details-in,
  .code :deep(.shiki .line.is-active) {
    animation: none;
  }
}
</style>
