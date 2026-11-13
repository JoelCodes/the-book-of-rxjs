<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import * as rx from 'rxjs'
import { EditorState, StateField, type Range } from '@codemirror/state'
import { EditorView, keymap, Decoration, type DecorationSet } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{ code?: string; height?: string }>()

type Entry = { t: number; type: 'next' | 'error' | 'complete' | 'log'; value: string }
type EditRange = { from: number; to: number }

const logs = ref<Entry[]>([])
const running = ref(false)
const locked = ref(false)
const editorEl = ref<HTMLElement | null>(null)
const slotEl = ref<HTMLElement | null>(null)
const view = shallowRef<EditorView | null>(null)

let subs: rx.Subscription[] = []
let start = 0

// Split source on // @editable / // @end markers. Returns the cleaned doc (markers
// removed) and the char ranges that stay editable — or null when there are no
// markers, meaning the whole document is editable.
function parse(raw: string): { doc: string; ranges: EditRange[] | null } {
  const out: string[] = []
  const editableLines: number[] = []
  let editing = false
  let hasMarkers = false
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (t === '// @editable') { editing = true; hasMarkers = true; continue }
    if (t === '// @end') { editing = false; continue }
    if (editing) editableLines.push(out.length)
    out.push(line)
  }
  const doc = out.join('\n')
  if (!hasMarkers) return { doc, ranges: null }

  const starts: number[] = []
  let off = 0
  for (const l of out) { starts.push(off); off += l.length + 1 }

  const ranges: EditRange[] = []
  for (const idx of editableLines) {
    const from = starts[idx]
    const to = from + out[idx].length
    const last = ranges[ranges.length - 1]
    if (last && from <= last.to + 1) last.to = to // merge adjacent editable lines
    else ranges.push({ from, to })
  }
  return { doc, ranges }
}

const editableMark = Decoration.mark({ class: 'cm-editable-region' })

function buildState(doc: string, ranges: EditRange[] | null) {
  const extensions = [
    basicSetup,
    javascript({ typescript: true }),
    keymap.of([indentWithTab]),
    oneDark,
    EditorView.theme({
      '&': { fontSize: '13px', borderRadius: '0' },
      '.cm-content': { fontFamily: 'var(--vp-font-family-mono)' },
      '.cm-editable-region': { backgroundColor: 'rgba(120,170,255,0.16)' },
      '&.cm-focused': { outline: 'none' },
    }),
  ]

  if (ranges) {
    locked.value = true
    const field = StateField.define<EditRange[]>({
      create: () => ranges,
      update: (val, tr) =>
        tr.docChanged
          ? val.map(r => ({ from: tr.changes.mapPos(r.from, -1), to: tr.changes.mapPos(r.to, 1) }))
          : val,
    })
    const guard = EditorState.transactionFilter.of(tr => {
      if (!tr.docChanged) return tr
      const rs = tr.startState.field(field)
      let ok = true
      tr.changes.iterChangedRanges((fromA, toA) => {
        if (!rs.some(r => fromA >= r.from && toA <= r.to)) ok = false
      })
      return ok ? tr : []
    })
    const deco = EditorView.decorations.compute([field], state => {
      const rs = state.field(field)
      const marks: Range<Decoration>[] = rs
        .filter(r => r.to > r.from)
        .map(r => editableMark.range(r.from, r.to))
      return Decoration.set(marks, true) as DecorationSet
    })
    extensions.push(field, guard, deco)
  }

  return EditorState.create({ doc, extensions })
}

function currentCode() {
  return view.value ? view.value.state.doc.toString() : (props.code ?? '')
}

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

  const subscribe = (obs: rx.Observable<unknown>, label = '') => {
    const tag = label ? label + ': ' : ''
    const sub = obs.subscribe({
      next: v => push('next', tag + fmt(v)),
      error: e => { push('error', tag + ((e as any)?.message ?? fmt(e))); running.value = subs.some(s => !s.closed) },
      complete: () => { push('complete', tag + '∎'); running.value = subs.some(s => !s.closed) },
    })
    subs.push(sub)
    return sub
  }
  const log = (...args: unknown[]) => push('log', args.map(fmt).join(' '))

  const names = Object.keys(rx)
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, 'subscribe', 'log', currentCode())
    fn(...names.map(n => (rx as any)[n]), subscribe, log)
  } catch (e: any) {
    push('error', e?.message ?? String(e))
    running.value = false
  }
  if (subs.length === 0) running.value = false
}

onMounted(() => {
  let raw = props.code ?? ''
  if (!raw && slotEl.value) {
    const code = slotEl.value.querySelector('code')
    if (code) raw = code.textContent ?? ''
  }
  raw = raw.replace(/^\n/, '').replace(/\n$/, '')
  const { doc, ranges } = parse(raw)
  view.value = new EditorView({ state: buildState(doc, ranges), parent: editorEl.value! })
})

onUnmounted(() => { teardown(); view.value?.destroy() })
</script>

<template>
  <div class="runrx">
    <div ref="slotEl" style="display: none"><slot /></div>
    <div ref="editorEl" class="runrx-editor" :style="{ '--rx-min': height ?? '8rem' }" />
    <div class="runrx-bar">
      <button class="runrx-run" @click="run">▶ Run</button>
      <button class="runrx-clear" @click="teardown(); logs = []">Clear</button>
      <span v-if="locked" class="runrx-locked" title="Only highlighted lines are editable">🔒 fill in the blanks</span>
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
.runrx-editor :deep(.cm-editor) { min-height: var(--rx-min, 8rem); }
.runrx-editor :deep(.cm-scroller) { overflow: auto; }
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
.runrx-locked { font-size: 12px; color: var(--vp-c-text-2); }
.runrx-live { color: var(--vp-c-green-1); font-size: 12px; margin-left: auto; }
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
