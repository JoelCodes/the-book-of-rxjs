<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as rx from 'rxjs'

const props = defineProps<{ code?: string; height?: string }>()

type Entry = { t: number; type: 'next' | 'error' | 'complete' | 'log'; value: string }

const src = ref((props.code ?? '').replace(/^\n/, ''))
const slotEl = ref<HTMLElement | null>(null)

// Prefer code passed via a slotted fenced block (keeps syntax highlighting in the
// source and avoids multiline-attribute parsing issues).
onMounted(() => {
  if (!props.code && slotEl.value) {
    const code = slotEl.value.querySelector('code')
    if (code) src.value = (code.textContent ?? '').replace(/\n$/, '')
  }
})
const logs = ref<Entry[]>([])
const running = ref(false)

let subs: rx.Subscription[] = []
let start = 0

function fmt(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v)
  try { return JSON.stringify(v) } catch { return String(v) }
}

function push(type: Entry['type'], value: string) {
  logs.value = [...logs.value, { t: Math.round(performance.now() - start), type, value }]
}

function teardown() {
  subs.forEach(s => s.unsubscribe())
  subs = []
  running.value = false
}

function run() {
  teardown()
  logs.value = []
  start = performance.now()
  running.value = true

  // Helper: subscribe to an observable and log its notifications on the timeline.
  const subscribe = (obs: rx.Observable<unknown>, label = '') => {
    const tag = label ? label + ': ' : ''
    const sub = obs.subscribe({
      next: v => push('next', tag + fmt(v)),
      error: e => { push('error', tag + (e?.message ?? fmt(e))); running.value = subs.some(s => !s.closed) },
      complete: () => { push('complete', tag + '∎'); running.value = subs.some(s => !s.closed) },
    })
    subs.push(sub)
    return sub
  }
  const log = (...args: unknown[]) => push('log', args.map(fmt).join(' '))

  const names = Object.keys(rx)
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, 'subscribe', 'log', src.value)
    fn(...names.map(n => (rx as any)[n]), subscribe, log)
  } catch (e: any) {
    push('error', e?.message ?? String(e))
    running.value = false
  }
  if (subs.length === 0) running.value = false
}

onUnmounted(teardown)
</script>

<template>
  <div class="runrx">
    <div ref="slotEl" style="display: none"><slot /></div>
    <textarea
      v-model="src"
      spellcheck="false"
      :style="{ height: height ?? '8rem' }"
      class="runrx-editor"
    />
    <div class="runrx-bar">
      <button class="runrx-run" @click="run">▶ Run</button>
      <button class="runrx-clear" @click="teardown(); logs = []">Clear</button>
      <span v-if="running" class="runrx-live">● live</span>
    </div>
    <div class="runrx-out">
      <div v-if="logs.length === 0" class="runrx-empty">Output appears here.</div>
      <div v-for="(e, i) in logs" :key="i" :class="['runrx-line', 'runrx-' + e.type]">
        <span class="runrx-t">{{ e.t }}ms</span>
        <span class="runrx-type">{{ e.type }}</span>
        <span class="runrx-val">{{ e.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.runrx {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
}
.runrx-editor {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.5;
  padding: 0.75rem;
  border: 0;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  resize: vertical;
}
.runrx-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}
.runrx-run, .runrx-clear {
  font-size: 13px;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.runrx-run { background: var(--vp-c-brand-1); color: #fff; border-color: transparent; }
.runrx-live { color: var(--vp-c-green-1); font-size: 12px; }
.runrx-out {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  padding: 0.5rem 0.75rem;
  max-height: 16rem;
  overflow: auto;
}
.runrx-empty { color: var(--vp-c-text-3); }
.runrx-line { display: flex; gap: 0.75rem; padding: 1px 0; }
.runrx-t { color: var(--vp-c-text-3); min-width: 3.5rem; text-align: right; }
.runrx-type { min-width: 4.5rem; }
.runrx-next .runrx-type { color: var(--vp-c-brand-1); }
.runrx-complete .runrx-type { color: var(--vp-c-green-1); }
.runrx-error .runrx-type { color: var(--vp-c-red-1); }
.runrx-log .runrx-type { color: var(--vp-c-text-3); }
.runrx-val { white-space: pre-wrap; word-break: break-word; }
</style>
