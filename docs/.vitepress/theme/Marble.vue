<script setup lang="ts">
import { computed } from 'vue'

// Static marble diagram from a marble string, e.g. "--a--b--c|".
//  letters/digits/symbols = an emitted value (looked up in `values`)
//  -  = one frame of time passing
//  |  = complete
//  #  = error
//  () = synchronous group, rendered on the same frame
const props = defineProps<{
  diagram: string
  values?: Record<string, string>
  label?: string
}>()

const FRAME = 28
const R = 11

type Mark = { x: number; kind: 'value' | 'complete' | 'error'; text?: string }

const parsed = computed(() => {
  const marks: Mark[] = []
  let frame = 0
  let inGroup = false
  for (const ch of props.diagram) {
    if (ch === ' ') continue
    if (ch === '-') { frame++; continue }
    if (ch === '(') { inGroup = true; continue }
    if (ch === ')') { inGroup = false; frame++; continue }
    const x = frame * FRAME + FRAME
    if (ch === '|') marks.push({ x, kind: 'complete' })
    else if (ch === '#') marks.push({ x, kind: 'error' })
    else marks.push({ x, kind: 'value', text: props.values?.[ch] ?? ch })
    if (!inGroup) frame++
  }
  const width = Math.max(frame * FRAME + FRAME * 2, 120)
  return { marks, width }
})
</script>

<template>
  <figure class="marble">
    <figcaption v-if="label">{{ label }}</figcaption>
    <svg :width="parsed.width" :height="44" :viewBox="`0 0 ${parsed.width} 44`">
      <line x1="4" y1="22" :x2="parsed.width - 4" y2="22" class="m-axis" />
      <polygon :points="`${parsed.width - 10},16 ${parsed.width - 2},22 ${parsed.width - 10},28`" class="m-axis-head" />
      <template v-for="(m, i) in parsed.marks" :key="i">
        <g v-if="m.kind === 'value'">
          <circle :cx="m.x" cy="22" :r="R" class="m-value" />
          <text :x="m.x" y="26" class="m-text">{{ m.text }}</text>
        </g>
        <line v-else-if="m.kind === 'complete'" :x1="m.x" y1="8" :x2="m.x" y2="36" class="m-complete" />
        <g v-else>
          <line :x1="m.x - 8" y1="14" :x2="m.x + 8" y2="30" class="m-error" />
          <line :x1="m.x + 8" y1="14" :x2="m.x - 8" y2="30" class="m-error" />
        </g>
      </template>
    </svg>
  </figure>
</template>

<style scoped>
.marble { margin: 1rem 0; overflow-x: auto; }
.marble figcaption { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 4px; }
.m-axis { stroke: var(--vp-c-text-3); stroke-width: 1.5; }
.m-axis-head { fill: var(--vp-c-text-3); }
.m-value { fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 1.5; }
.m-text { text-anchor: middle; font-size: 12px; font-weight: 600; fill: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.m-complete { stroke: var(--vp-c-text-1); stroke-width: 2.5; }
.m-error { stroke: var(--vp-c-red-1); stroke-width: 2.5; }
</style>
