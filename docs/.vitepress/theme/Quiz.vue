<script setup lang="ts">
import { ref } from 'vue'

// Auto-graded multiple-choice question.
//   <Quiz question="..." :options="['a','b','c']" :answer="1" explanation="..." />
const props = defineProps<{
  question: string
  options: string[]
  answer: number
  explanation?: string
}>()

const picked = ref<number | null>(null)
const choose = (i: number) => { if (picked.value === null) picked.value = i }
const correct = (i: number) => picked.value !== null && i === props.answer
const wrong = (i: number) => picked.value === i && i !== props.answer
</script>

<template>
  <div class="quiz">
    <p class="quiz-q">{{ question }}</p>
    <ul class="quiz-opts">
      <li v-for="(opt, i) in options" :key="i">
        <button
          class="quiz-opt"
          :class="{ correct: correct(i), wrong: wrong(i), locked: picked !== null }"
          :disabled="picked !== null"
          @click="choose(i)"
        >
          <span class="quiz-mark">
            <template v-if="correct(i)">✓</template>
            <template v-else-if="wrong(i)">✗</template>
          </span>
          {{ opt }}
        </button>
      </li>
    </ul>
    <div v-if="picked !== null" class="quiz-result">
      <strong>{{ picked === answer ? 'Correct!' : 'Not quite.' }}</strong>
      <span v-if="explanation"> {{ explanation }}</span>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  background: var(--vp-c-bg-alt);
}
.quiz-q { font-weight: 600; margin: 0 0 0.75rem; }
.quiz-opts { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
.quiz-opt {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}
.quiz-opt.locked { cursor: default; }
.quiz-opt:not(.locked):hover { border-color: var(--vp-c-brand-1); }
.quiz-opt.correct { border-color: var(--vp-c-green-1); background: var(--vp-c-green-soft); }
.quiz-opt.wrong { border-color: var(--vp-c-red-1); background: var(--vp-c-red-soft); }
.quiz-mark { display: inline-block; width: 1rem; font-weight: 700; }
.quiz-result { margin-top: 0.75rem; font-size: 14px; }
</style>
