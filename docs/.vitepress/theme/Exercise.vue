<script setup lang="ts">
import { useSlots } from 'vue'

// Open coding exercise: a prompt + a runnable attempt area + collapsible
// hint and solution (self-check, as chosen in the design).
//   <Exercise title="Filter even numbers">
//     prompt prose + a <RunRx> starter...
//     <template #hint>...</template>
//     <template #solution>...</template>
//   </Exercise>
defineProps<{ title?: string }>()
const slots = useSlots()
</script>

<template>
  <section class="exercise">
    <header class="ex-head">
      <span class="ex-badge">Exercise</span>
      <span v-if="title" class="ex-title">{{ title }}</span>
    </header>
    <div class="ex-body">
      <slot />
    </div>
    <details v-if="slots.hint" class="ex-reveal ex-hint">
      <summary>Show a hint</summary>
      <div class="ex-reveal-body"><slot name="hint" /></div>
    </details>
    <details v-if="slots.solution" class="ex-reveal ex-solution">
      <summary>Show the solution</summary>
      <div class="ex-reveal-body"><slot name="solution" /></div>
    </details>
  </section>
</template>

<style scoped>
.exercise {
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-green-1);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 1.25rem 0;
  background: var(--vp-c-bg-alt);
}
.ex-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.ex-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-green-1);
  border: 1px solid var(--vp-c-green-1);
  border-radius: 4px;
  padding: 1px 6px;
}
.ex-title { font-weight: 600; }
.ex-body > :first-child { margin-top: 0; }
.ex-reveal { margin-top: 0.5rem; }
.ex-reveal > summary { cursor: pointer; font-size: 14px; color: var(--vp-c-brand-1); }
.ex-reveal-body { padding-top: 0.5rem; }
.ex-reveal-body > :first-child { margin-top: 0; }
</style>
