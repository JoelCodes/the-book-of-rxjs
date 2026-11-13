import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import RunRx from './RunRx.vue'
import Marble from './Marble.vue'
import Quiz from './Quiz.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RunRx', RunRx)
    app.component('Marble', Marble)
    app.component('Quiz', Quiz)
  },
} satisfies Theme
